const sketch1 = (p) => {
  let mapData;
  let rentData;
  let hoveredBorough = null;

  p.preload = () => {
    mapData = p.loadJSON("london.geojson");
    rentData = p.loadJSON("london_rent_2025_one_bed.json");
  };

  p.setup = () => {
    let canvas = p.createCanvas(1000, 1000);
    canvas.parent("chart1"); 
    p.noLoop();
  };

  p.draw = () => {
    p.background('#121f40');
    hoveredBorough = null;

    p.translate(p.width / 2, p.height / 2);

    for (let feature of mapData.features) {
      if (isMouseNearFeature(feature)) {
        hoveredBorough = feature.properties.name;
        break;
      }
    }

    for (let feature of mapData.features) {
      let borough = feature.properties.name;
      if (borough === hoveredBorough) continue;
      let rent = rentData[borough];
      drawBorough(feature, rent, false);
    }

    for (let feature of mapData.features) {
      if (feature.properties.name === hoveredBorough) {
        let rent = rentData[hoveredBorough];
        drawBorough(feature, rent, true);
      }
    }

    if (hoveredBorough) {
      let label = `${hoveredBorough} - £${rentData[hoveredBorough]}`;
      p.textSize(14);
      let padding = 8;
      let textW = p.textWidth(label);
      let textH = 20;
      let x = -p.width / 2 + 20;
      let y = -p.height / 2 + 20;
      p.fill(255);
      p.stroke(200);
      p.rect(x - padding / 2, y - padding / 2, textW + padding, textH + padding, 5);
      p.noStroke();
      p.fill(0);
      p.text(label, x, y + textH / 2);
    }
  };

  p.mouseMoved = () => {
    p.redraw();
  };

  function drawPolygon(coords, scaleFactor = 1, customCenter = null) {
    let centerX = 0, centerY = 0;
    if (customCenter) {
      [centerX, centerY] = customCenter;
    } else {
      for (let pt of coords) {
        centerX += p.map(pt[0], -0.6, 0.3, -500, 500);
        centerY += p.map(pt[1], 51.25, 51.7, 500, -500);
      }
      centerX /= coords.length;
      centerY /= coords.length;
    }

    p.beginShape();
    for (let pt of coords) {
      let x = p.map(pt[0], -0.6, 0.3, -500, 500);
      let y = p.map(pt[1], 51.25, 51.7, 500, -500);
      x = centerX + (x - centerX) * scaleFactor;
      y = centerY + (y - centerY) * scaleFactor;
      p.vertex(x, y);
    }
    p.endShape(p.CLOSE);
  }

  function isMouseNearFeature(feature) {
    let coords = feature.geometry.type === "Polygon"
      ? feature.geometry.coordinates[0]
      : feature.geometry.coordinates[0][0];

    let center = getPolygonCenter(coords);
    let mx = p.mouseX - p.width / 2;
    let my = p.mouseY - p.height / 2;
    return p.dist(mx, my, center[0], center[1]) < 25;
  }

  function getPolygonCenter(coords) {
    let sumX = 0, sumY = 0;
    for (let pt of coords) {
      sumX += p.map(pt[0], -0.6, 0.3, -500, 500);
      sumY += p.map(pt[1], 51.25, 51.7, 500, -500);
    }
    return [sumX / coords.length, sumY / coords.length];
  }

  function getColor(rent) {
    if (!rent) return p.color('#eeeeee');
    if (rent <= 1100) return p.color('#c6dbef');
    else if (rent <= 1300) return p.color('#9ecae1');
    else if (rent <= 1500) return p.color('#6baed6');
    else if (rent <= 1700) return p.color('#4292c6');
    else if (rent <= 1900) return p.color('#2171b5');
    else return p.color('#084594');
  }

  function drawBorough(feature, rent, isHovered) {
    let col = getColor(rent);
    let scaleFactor = isHovered ? 1.6 : 1;

    let allCoords = [];
    if (feature.geometry.type === "Polygon") {
      allCoords = feature.geometry.coordinates[0];
    } else if (feature.geometry.type === "MultiPolygon") {
      allCoords = feature.geometry.coordinates.flat(2);
    }

    let centerX = 0, centerY = 0;
    for (let pt of allCoords) {
      centerX += p.map(pt[0], -0.6, 0.3, -500, 500);
      centerY += p.map(pt[1], 51.25, 51.7, 500, -500);
    }
    centerX /= allCoords.length;
    centerY /= allCoords.length;
    let center = [centerX, centerY];

    if (isHovered) {
      if (feature.geometry.type === "Polygon") {
        drawShadowPolygon(feature.geometry.coordinates[0], scaleFactor, center);
      } else {
        for (let part of feature.geometry.coordinates) {
          drawShadowPolygon(part[0], scaleFactor, center);
        }
      }
    }

    p.fill(isHovered ? p.lerpColor(col, p.color(255), 0.3) : col);
    p.stroke(isHovered ? 'black' : 0);
    p.strokeWeight(isHovered ? 1.5 : 0.2);

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
        centerX += p.map(pt[0], -0.6, 0.3, -500, 500);
        centerY += p.map(pt[1], 51.25, 51.7, 500, -500);
      }
      centerX /= coords.length;
      centerY /= coords.length;
    }

    p.fill(0, 50);
    p.noStroke();
    p.beginShape();
    for (let pt of coords) {
      let x = p.map(pt[0], -0.6, 0.3, -500, 500);
      let y = p.map(pt[1], 51.25, 51.7, 500, -500);
      x = centerX + (x - centerX) * scaleFactor + 5;
      y = centerY + (y - centerY) * scaleFactor + 5;
      p.vertex(x, y);
    }
    p.endShape(p.CLOSE);
  }
};

// 创建实例
new p5(sketch1);
