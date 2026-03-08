import type { AddProtocolAction } from "maplibre-gl";

/** Sentinel elevation value for nodata pixels */
export const NODATA_ELEVATION = -32768;

/**
 * Convert GSI DEM RGB encoding to Terrarium RGB encoding.
 * GSI nodata (128,0,0) is mapped to Terrarium (0,0,0) = elevation -32768m.
 */
export const convertGsiToTerrarium = (
  r: number,
  g: number,
  b: number,
): [number, number, number] => {
  const x = (r << 16) | (g << 8) | b;
  const NODATA_RAW = 1 << 23; // 8388608 = (128,0,0)

  if (x === NODATA_RAW) {
    // nodata → terrarium (0,0,0) = elevation -32768m
    return [0, 0, 0];
  }

  // Decode GSI DEM elevation
  let elevation: number;
  if (x < NODATA_RAW) {
    elevation = x * 0.01;
  } else {
    elevation = (x - (1 << 24)) * 0.01;
  }

  // Encode as Terrarium: elevation = (R * 256 + G + B / 256) - 32768
  const s = elevation + 32768;
  const tR = Math.floor(s / 256);
  const tG = Math.floor(s) % 256;
  const tB = Math.floor((s - Math.floor(s)) * 256);

  return [tR, tG, tB];
};

/**
 * Create a MapLibre protocol action for GSI DEM relief tiles.
 * This protocol converts GSI DEM encoding to Terrarium encoding,
 * mapping nodata pixels to the sentinel elevation -32768m.
 */
export const getGsiDemReliefProtocolAction = (
  protocolName: string,
): AddProtocolAction => {
  const prefix = `${protocolName}://`;

  return (params, abortController) => {
    const url = params.url.replace(prefix, "");

    return fetch(url, { signal: abortController.signal })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP ${String(response.status)}`);
        }
        return response.blob();
      })
      .then((blob) => createImageBitmap(blob, { colorSpaceConversion: "none" }))
      .then((bitmap) => {
        const width = bitmap.width;
        const height = bitmap.height;

        const canvas = new OffscreenCanvas(width, height);
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          throw new Error("Failed to get 2d context");
        }

        ctx.drawImage(bitmap, 0, 0);
        const imageData = ctx.getImageData(0, 0, width, height);
        const { data } = imageData;

        for (let i = 0; i < data.length; i += 4) {
          const [tR, tG, tB] = convertGsiToTerrarium(
            data[i],
            data[i + 1],
            data[i + 2],
          );
          data[i] = tR;
          data[i + 1] = tG;
          data[i + 2] = tB;
          data[i + 3] = 255;
        }

        ctx.putImageData(imageData, 0, 0);

        return canvas.convertToBlob().then((resultBlob) =>
          createImageBitmap(resultBlob, {
            colorSpaceConversion: "none",
          }),
        );
      })
      .then((bitmap) => ({ data: bitmap }));
  };
};
