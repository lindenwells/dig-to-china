
const digToChina = (point) => ({ lat: -point.lat, lng: ((point.lng - Math.sign(point.lng) * 180) % 360) })

let point = { lat: -27.466206, lng: 153.024819, color: "red" }
const opposite = { ...digToChina(point), color: "blue" }


const points = [point, opposite].map(({ lat, lng, color }) => ({lat, lng, color, size: 0.5}))

const globe = new Globe(document.getElementById('globeViz'))
    .globeImageUrl('//cdn.jsdelivr.net/npm/three-globe/example/img/earth-day.jpg')
    .pointsData(points)
    .pointAltitude('size')
    .pointColor('color')
    .onGlobeClick(({ lat, lng }) => {
        point = { ...point, lat, lng };
        globe.pointsData([point, { ...digToChina(point), color: "blue"}].map(({ lat, lng, color }) => ({lat, lng, color, size: 0.5})))
    });

