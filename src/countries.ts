import booleanPointInPolygon from "@turf/boolean-point-in-polygon";
import type { Feature, FeatureCollection, Polygon, MultiPolygon } from "geojson";

export type CountryFeature = Feature<Polygon | MultiPolygon>;

let countriesData: FeatureCollection<Polygon | MultiPolygon> | null = null;

export async function loadCountries(): Promise<FeatureCollection<Polygon | MultiPolygon>> {
  if (countriesData) return countriesData;
  const resp = await fetch(import.meta.env.BASE_URL + "ne_110m_admin_0_countries.geojson");
  countriesData = await resp.json();
  return countriesData!;
}

export function findCountryAtPoint(lat: number, lng: number): CountryFeature | null {
  if (!countriesData) return null;
  for (const feature of countriesData.features) {
    const bbox = feature.bbox;
    if (bbox) {
      const [minLng, minLat, maxLng, maxLat] = bbox;
      if (lng < minLng || lng > maxLng || lat < minLat || lat > maxLat) continue;
    }
    if (booleanPointInPolygon([lng, lat], feature)) {
      return feature;
    }
  }
  return null;
}

function antipodalCoord(coord: [number, number]): [number, number] {
  const [lng, lat] = coord;
  return [lng > 0 ? lng - 180 : lng + 180, -lat];
}

export function antipodalFeature(feature: CountryFeature): CountryFeature {
  const geom = feature.geometry;

  if (geom.type === "Polygon") {
    return {
      ...feature,
      geometry: {
        type: "Polygon",
        coordinates: geom.coordinates.map((ring) =>
          ring.map((coord) => antipodalCoord(coord as [number, number])).reverse()
        ),
      },
    };
  }

  return {
    ...feature,
    geometry: {
      type: "MultiPolygon",
      coordinates: (geom as MultiPolygon).coordinates.map((polygon) =>
        polygon.map((ring) =>
          ring.map((coord) => antipodalCoord(coord as [number, number])).reverse()
        )
      ),
    },
  };
}
