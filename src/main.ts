import Globe from "globe.gl";
import {
  loadCountries,
  findCountryAtPoint,
  antipodalFeature,
  type CountryFeature,
} from "./countries";

const digToChina = (point: { lat: number; lng: number }) => ({
  lat: -point.lat,

  lng: point.lng > 0 ? point.lng - 180 : point.lng + 180,
});

let countryOutlinesEnabled = false;
let currentPoint = { lat: -27.466206, lng: 153.024819 };

const globe = new Globe(document.getElementById("app")!)
  .globeTileEngineUrl(
    (x, y, l) => `https://tile.openstreetmap.org/${l}/${x}/${y}.png`,
  )
  .pointsData(buildPoints(currentPoint))
  .pointAltitude("size")
  .pointColor("color")
  .polygonsData([])
  .polygonGeoJsonGeometry(
    ((d: object) => (d as CountryFeature).geometry) as never,
  )
  .polygonCapColor(() => "rgba(0,0,0,0)")
  .polygonSideColor(() => "rgba(0,0,0,0)")
  .polygonStrokeColor(
    (d: object) =>
      ((d as CountryFeature).properties as Record<string, string>)?.__color ??
      "#4488ff",
  )
  .polygonAltitude(0.006)
  .onGlobeClick(handleClick);

// Toggle button
const btn = document.createElement("button");
btn.textContent = "Country Outlines";
btn.style.cssText = `
  position: fixed; top: 12px; left: 12px; z-index: 1000;
  padding: 8px 14px; border: 1px solid rgba(255,255,255,0.3);
  border-radius: 6px; background: rgba(0,0,0,0.6); color: #fff;
  font-size: 14px; cursor: pointer; backdrop-filter: blur(4px);
`;
btn.addEventListener("click", async () => {
  countryOutlinesEnabled = !countryOutlinesEnabled;
  btn.style.background = countryOutlinesEnabled
    ? "rgba(30,90,180,0.7)"
    : "rgba(0,0,0,0.6)";
  if (countryOutlinesEnabled) {
    await loadCountries();
    updateCountryOutlines(currentPoint);
  } else {
    globe.polygonsData([]);
  }
});
document.body.appendChild(btn);

function buildPoints(pt: { lat: number; lng: number }) {
  const opposite = digToChina(pt);
  return [
    { lat: pt.lat, lng: pt.lng, color: "red", size: 0.5 },
    { lat: opposite.lat, lng: opposite.lng, color: "blue", size: 0.5 },
  ];
}

function handleClick({ lat, lng }: { lat: number; lng: number }) {
  currentPoint = { lat, lng };
  globe.pointsData(buildPoints(currentPoint));
  if (countryOutlinesEnabled) {
    updateCountryOutlines(currentPoint);
  }
}

function updateCountryOutlines(pt: { lat: number; lng: number }) {
  const country = findCountryAtPoint(pt.lat, pt.lng);
  if (!country) {
    globe.polygonsData([]);
    return;
  }
  const clicked = {
    ...country,
    properties: { ...country.properties, __color: "#4488ff" },
  };
  const antipodal = {
    ...antipodalFeature(country),
    properties: { ...antipodalFeature(country).properties, __color: "#ff4444" },
  };
  globe.polygonsData([clicked, antipodal]);
}
