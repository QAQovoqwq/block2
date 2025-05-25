let mapData;
let rentData;

let hoveredBorough = null;

function preload() {
  mapData = loadJSON("london.geojson");
  rentData = loadJSON("rents.json");
}

function setup() {
  createCanvas(1000, 1000);
  noLoop();
}

function draw() {
  background('#121f40');
  hoveredBorough = null;
  

  translate(width / 2, height / 2);
  scale(1);

  // 先判断哪个区被鼠标靠近
  for (let feature of mapData.features) {
    if (isMouseNearFeature(feature)) {
      hoveredBorough = feature.properties.name;
      break;
    }
  }

  // 再绘制非 hovered 区域
  for (let feature of mapData.features) {
    let borough = feature.properties.name;
    if (borough === hoveredBorough) continue;

    let rent = rentData[borough];
    drawBorough(feature, rent, false);
  }

  // 最后绘制 hovered 区域（高亮+放大）
  for (let feature of mapData.features) {
    if (feature.properties.name === hoveredBorough) {
      let rent = rentData[hoveredBorough];
      drawBorough(feature, rent, true);
    }
  }

  // 悬浮文本提示
  if (hoveredBorough) {
  let label = `${hoveredBorough} - £${rentData[hoveredBorough]}`;
  textSize(14);
  let padding = 8;
  let textW = textWidth(label);
  let textH = 20;

  let x = -width / 2 + 20;
  let y = -height / 2 + 20;

  // 背景白色框
  fill(255);
  stroke(200);
  rect(x - padding / 2, y - padding / 2, textW + padding, textH + padding, 5); // 圆角可选

  // 文字
  noStroke();
  fill(0);
  text(label, x, y + textH / 2);
}

}


function mouseMoved() {
  redraw();
}

function drawPolygon(coords, scaleFactor = 1, customCenter = null) {
  let centerX = 0, centerY = 0;
  if (customCenter) {
    [centerX, centerY] = customCenter;
  } else {
    for (let pt of coords) {
      centerX += map(pt[0], -0.6, 0.3, -500, 500);
      centerY += map(pt[1], 51.25, 51.7, 500, -500);
    }
    centerX /= coords.length;
    centerY /= coords.length;
  }

  beginShape();
  for (let pt of coords) {
    let x = map(pt[0], -0.6, 0.3, -500, 500);
    let y = map(pt[1], 51.25, 51.7, 500, -500);
    x = centerX + (x - centerX) * scaleFactor;
    y = centerY + (y - centerY) * scaleFactor;
    vertex(x, y);
  }
  endShape(CLOSE);
}



function isMouseNearFeature(feature) {
  let coords = feature.geometry.type === "Polygon"
    ? feature.geometry.coordinates[0]
    : feature.geometry.coordinates[0][0];

  let center = getPolygonCenter(coords);
  let mx = mouseX - width / 2;
  let my = mouseY - height / 2;

  return dist(mx, my, center[0], center[1]) < 25; // 增大容错范围
}

function getPolygonCenter(coords) {
  let sumX = 0, sumY = 0;
  for (let pt of coords) {
    sumX += map(pt[0], -0.6, 0.3, -500, 500);
    sumY += map(pt[1], 51.25, 51.7, 500, -500);
  }
  return [sumX / coords.length, sumY / coords.length];
}

function getColor(rent) {
  if (!rent) return color(220);
  else if (rent > 3000) return color('#800026');
  else if (rent > 2500) return color('#BD0026');
  else if (rent > 2000) return color('#E31A1C');
  else if (rent > 1500) return color('#FC4E2A');
  else if (rent > 1000) return color('#FD8D3C');
  else return color('#FED976');
}

//放大函数
function drawBorough(feature, rent, isHovered) {
  let col = getColor(rent);
  let scaleFactor = isHovered ? 1.6 : 1;

  // 🧠 统一中心点
  let allCoords = [];
  if (feature.geometry.type === "Polygon") {
    allCoords = feature.geometry.coordinates[0];
  } else if (feature.geometry.type === "MultiPolygon") {
    allCoords = feature.geometry.coordinates.flat(2);  // 扁平化所有点
  }

  let centerX = 0, centerY = 0;
  for (let pt of allCoords) {
    centerX += map(pt[0], -0.6, 0.3, -500, 500);
    centerY += map(pt[1], 51.25, 51.7, 500, -500);
  }
  centerX /= allCoords.length;
  centerY /= allCoords.length;
  let center = [centerX, centerY];

  // 🟫 阴影
  if (isHovered) {
    if (feature.geometry.type === "Polygon") {
      drawShadowPolygon(feature.geometry.coordinates[0], scaleFactor, center);
    } else {
      for (let part of feature.geometry.coordinates) {
        drawShadowPolygon(part[0], scaleFactor, center);
      }
    }
  }

  // 🎨 正式绘图
  fill(isHovered ? lerpColor(col, color(255), 0.3) : col);
  stroke(isHovered ? 'black' : 0);
  strokeWeight(isHovered ? 1.5 : 0.2);

  if (feature.geometry.type === "Polygon") {
    drawPolygon(feature.geometry.coordinates[0], scaleFactor, center);
  } else {
    for (let part of feature.geometry.coordinates) {
      drawPolygon(part[0], scaleFactor, center);
    }
  }
}



function drawShadowPolygon(coords, scaleFactor = 1, customCenter = null) {
  let centerX = 0, centerY = 0;
  if (customCenter) {
    [centerX, centerY] = customCenter;
  } else {
    for (let pt of coords) {
      centerX += map(pt[0], -0.6, 0.3, -500, 500);
      centerY += map(pt[1], 51.25, 51.7, 500, -500);
    }
    centerX /= coords.length;
    centerY /= coords.length;
  }

  fill(0, 50);
  noStroke();
  beginShape();
  for (let pt of coords) {
    let x = map(pt[0], -0.6, 0.3, -500, 500);
    let y = map(pt[1], 51.25, 51.7, 500, -500);
    x = centerX + (x - centerX) * scaleFactor + 5;
    y = centerY + (y - centerY) * scaleFactor + 5;
    vertex(x, y);
  }
  endShape(CLOSE);
}


function getColor(rent) {
  if (!rent) return color('#eeeeee'); // 无数据灰色

  if (rent <= 1000) return color('#c6dbef');
  else if (rent <= 1300) return color('#9ecae1');
  else if (rent <= 1600) return color('#6baed6');
  else if (rent <= 1900) return color('#4292c6');
  else if (rent <= 2200) return color('#2171b5');
  else if (rent <= 2600) return color('#084594');
  else return color('#084594');
}



