

let dots = [];
let currentWordIndex = 0;
let targetPoints = [];
let words = [
  "CRAVING", "PURSUING", "CONNECTING", "HOPING", "DOUBTING", "QUESTIONING",
  "PULLING BACK", "DISTANCE", "LONGING", "FUCKING", "ANXIETY", "RUMINATING", "NEEDING",
  "REACHING OUT", "BRIEF REASSURANCE", "FEARING LOSS", "CLOSING OFF",
  "REPEATING", "TRYING", "WORKING ON IT", "REPEATING"
];
let wordChangeInterval = 3000;
let lastChangeTime = 0;

// Rainbow coloring variables
let baseHue = 0;
let hueStep;

// The rest of the full sketch.js code here (from previous message)

function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont("sans-serif");
  textAlign(CENTER, CENTER);
  colorMode(HSB, 360, 100, 100);

  let gridStep = 12;
  for (let y = 0; y < height; y += gridStep) {
    for (let x = 0; x < width; x += gridStep) {
      dots.push({
        x: x,
        y: y,
        tx: x,
        ty: y,
        phase: random(TWO_PI),
        baseSize: random(2, 10),
        alpha: 0
      });
    }
  }

  hueStep = 360 / words.length;
  updateTargetPoints();
}

function draw() {
  background(255);

  let timeSinceChange = millis() - lastChangeTime;
  let fadeProgress = constrain(timeSinceChange / (wordChangeInterval / 2), 0, 1);

  if (timeSinceChange > wordChangeInterval) {
    currentWordIndex = (currentWordIndex + 1) % words.length;
    baseHue = (baseHue + hueStep) % 360;
    updateTargetPoints();
    lastChangeTime = millis();
  }

  for (let i = 0; i < dots.length; i++) {
    let dot = dots[i];

    dot.x += (dot.tx - dot.x) * 0.1;
    dot.y += (dot.ty - dot.y) * 0.1;

    let dx = mouseX - dot.x;
    let dy = mouseY - dot.y;
    let distToMouse = sqrt(dx * dx + dy * dy);
    if (distToMouse < 80) {
      let repelStrength = map(distToMouse, 0, 80, 5, 0, true);
      let angle = atan2(dy, dx);
      dot.x += cos(angle) * -repelStrength;
      dot.y += sin(angle) * -repelStrength;
    }

    fill(baseHue, 100, 100, fadeProgress * 100);
    noStroke();

    let wiggleAmount = 2;
    let wiggleX = cos(dot.phase + millis() * 0.002) * wiggleAmount;
    let wiggleY = sin(dot.phase + millis() * 0.002) * wiggleAmount;

    let sizeOsc = map(sin(dot.phase + millis() * 0.004), -1, 1, 0.8, 1.2);
    let sizeFactor = dot.baseSize * sizeOsc;

    ellipse(dot.x + wiggleX, dot.y + wiggleY, sizeFactor);
  }
}

function updateTargetPoints() {
  targetPoints = [];
  let lines = words[currentWordIndex].split(" ");

  let stretchFactorX = 1.2;
  let stretchFactorY = 2.5;

  let baseLineSpacing = min(width, height) / 6;
  let lineSpacing = baseLineSpacing * stretchFactorY;

  let totalLineHeight = (lines.length - 1) * lineSpacing;
  let yMin = totalLineHeight / 2 + 50;
  let yMax = height - totalLineHeight / 2 - 50;
  let yOffset = random(yMin, yMax);

  for (let i = 0; i < lines.length; i++) {
    let baseFontSize;
    if (i === 0 && lines.length > 1) {
      baseFontSize = min(width, height) / 6;
    } else {
      baseFontSize = min(width, height) / 4;
    }

    let targetMaxWidth = width * 0.8;

    let testPg = createGraphics(width, height);
    testPg.textFont("sans-serif");
    testPg.textSize(baseFontSize);
    let textW = testPg.textWidth(lines[i]);

    let fontSize = baseFontSize;
    if (textW > targetMaxWidth) {
      let scaleFactor = targetMaxWidth / textW;
      fontSize *= scaleFactor;
    }
    testPg.remove();

    let lineY = yOffset + (i - (lines.length - 1) / 2) * lineSpacing;

    let linePoints = fontTextToPoints(lines[i], width / 2, lineY, fontSize, {
      sampleFactor: 0.2
    });

    for (let p of linePoints) {
      p.x = width / 2 + (p.x - width / 2) * stretchFactorX;
      p.y = lineY + (p.y - lineY) * stretchFactorY;

      p.x += random(-4, 4);
      p.y += random(-4, 4);

      targetPoints.push(p);
    }
  }

  shuffle(targetPoints, true);

  for (let i = 0; i < dots.length; i++) {
    if (i < targetPoints.length) {
      dots[i].tx = targetPoints[i].x;
      dots[i].ty = targetPoints[i].y;
      dots[i].alpha = 0;
    } else {
      dots[i].tx = random(width);
      dots[i].ty = random(height);
    }
  }
}

function fontTextToPoints(txt, x, y, size, options) {
  let pg = createGraphics(width, height);
  pg.pixelDensity(1);
  pg.background(0);
  pg.textAlign(CENTER, CENTER);
  pg.textSize(size);
  pg.textFont("sans-serif");
  pg.fill(255);
  pg.text(txt, x, y);

  pg.loadPixels();
  let pts = [];
  let density = options.sampleFactor * 10;
  for (let i = 0; i < pg.width; i += density) {
    for (let j = 0; j < pg.height; j += density) {
      let index = 4 * (i + j * pg.width);
      let brightnessVal = pg.pixels[index];
      if (brightnessVal > 128) {
        pts.push({ x: i, y: j });
      }
    }
  }
  pg.remove();
  return pts;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  updateTargetPoints();
}
