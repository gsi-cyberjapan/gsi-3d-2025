export interface ElevationResult {
  elevation: number;
  hsrc: string;
}

export async function getElevationFromLatLng(
  lat: number,
  lon: number,
): Promise<ElevationResult | null> {
  const url = new URL(
    "https://cyberjapandata2.gsi.go.jp/general/dem/scripts/getelevation.php",
  );
  url.searchParams.set("lat", lat.toString());
  url.searchParams.set("lon", lon.toString());
  url.searchParams.set("outtype", "JSON");

  const res = await fetch(url.toString());
  if (!res.ok) return null;

  const json: unknown = await res.json();

  if (
    typeof json === "object" &&
    json !== null &&
    "elevation" in json &&
    "hsrc" in json
  ) {
    const d = json as { elevation: unknown; hsrc: unknown };

    if (typeof d.elevation === "number" && typeof d.hsrc === "string") {
      return { elevation: d.elevation, hsrc: d.hsrc };
    }
  }

  return null;
}
