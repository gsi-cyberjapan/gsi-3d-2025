interface DMS {
  degrees: number;
  minutes: number;
  seconds: number;
}

function toDMS(decimal: number): DMS {
  const absolute = Math.abs(decimal);
  let degrees = Math.floor(absolute);
  let minutes = Math.floor((absolute - degrees) * 60);
  let seconds =
    Math.round(((absolute - degrees) * 60 - minutes) * 60 * 100) / 100;

  if (seconds >= 60) {
    seconds -= 60;
    minutes += 1;
  }
  if (minutes >= 60) {
    minutes -= 60;
    degrees += 1;
  }

  return { degrees, minutes, seconds };
}

export function latLngToDMS(
  lat: number,
  lng: number,
): { lat: string; lng: string } {
  const latDMS = toDMS(lat);
  const lngDMS = toDMS(lng);
  const latSign = lat < 0 ? "-" : "";
  const lngSign = lng < 0 ? "-" : "";

  return {
    lat: `${latSign}${String(latDMS.degrees)}度${String(latDMS.minutes)}分${latDMS.seconds.toFixed(2)}秒`,
    lng: `${lngSign}${String(lngDMS.degrees)}度${String(lngDMS.minutes)}分${lngDMS.seconds.toFixed(2)}秒`,
  };
}
