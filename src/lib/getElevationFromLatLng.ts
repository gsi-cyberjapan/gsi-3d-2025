export async function getElevationFromLatLng(
  lat: number,
  lon: number,
): Promise<number | null> {
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

    return typeof d.elevation === "number" ? d.elevation : null;
  }

  return null;
}
