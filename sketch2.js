const sketch2 = (p) => {
  p.setup = () => {
    let canvas = p.createCanvas(400, 300);
    canvas.parent("chart2"); // 挂载到 <div id="chart2">
    p.background(240);
  };

  p.draw = () => {
    p.background(240);
    p.fill(100, 150, 255);
    p.noStroke();
    p.ellipse(p.width / 2, p.height / 2, 100, 100); // 示例图形
  };
};

new p5(sketch2);
