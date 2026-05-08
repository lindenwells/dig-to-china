
const point = { lat: -27.466206, lng: 153.024819, color: "red" }
const opposite = { lat: -point.lat, lng: ((point.lng -Math.sign(point.lng) * 180) % 360), color: "blue" }

const points = [point, opposite].map(({ lat, lng, color }) => ({lat, lng, color, size: 0.5}))

new Globe(document.getElementById('globeViz'))
    .globeImageUrl('//cdn.jsdelivr.net/npm/three-globe/example/img/earth-day.jpg')
    .pointsData(points)
    .pointAltitude('size')
    .pointColor('color');
