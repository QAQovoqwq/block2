let mapData;
let centerXY;

function preload() {
  mapData = loadJSON("london.geojson");
}

function setup() {
  let canvas = createCanvas(1000, 1000);
  canvas.parent("chart1"); // 将画布嵌入到 HTML 中的 div#chart1 中

  // 地图中心经纬度转换成 XY 坐标
  const centerLonLat = [-0.1, 51.5];
  centerXY = [
    map(centerLonLat[0], -0.6, 0.3, -500, 500),
    map(centerLonLat[1], 51.25, 51.7, 500, -500)
  ];

  noLoop(); // 初始不自动重绘
}

function draw() {
  clear();
  background("#121f40");

  translate(width / 2, height / 2);

  let scrollRatio = constrain(window.scrollY / windowHeight, 0, 1); // 滚动进度 0~1

  for (let feature of mapData.features) {
    let coords = feature.geometry.type === "Polygon"
      ? feature.geometry.coordinates[0]
      : feature.geometry.coordinates[0][0];

    let [cx, cy] = getPolygonCenter(coords);

    let dx = cx - centerXY[0];
    let dy = cy - centerXY[1];
    let distance = sqrt(dx * dx + dy * dy);

    let baseRadius = 10;
    let maxRadius = 120;
    let radius = baseRadius + scrollRatio * (maxRadius - baseRadius) * (1 - distance / 500);

    // 颜色从黄 (#ffea00) 到红 (#d50000)
    let distRatio = constrain(distance / 500, 0, 1);
    let col = lerpColor(color("#ffea00"), color("#d50000"), distRatio);

    noStroke();
    fill(col);
    ellipse(cx, cy, radius);
  }
}

function getPolygonCenter(coords) {
  let sumX = 0, sumY = 0;
  for (let pt of coords) {
    sumX += map(pt[0], -0.6, 0.3, -500, 500);
    sumY += map(pt[1], 51.25, 51.7, 500, -500);
  }
  return [sumX / coords.length, sumY / coords.length];
}

function windowScrolled() {
  redraw(); // 滚动时重绘
}
