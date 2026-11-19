/**
 * Gera ícones/splash AppPeladas (verde campo + bola) com pngjs.
 * Uso: node scripts/generate-brand-assets.js
 */
const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const BRAND = { r: 0x1b, g: 0x43, b: 0x32, a: 255 };
const ACCENT = { r: 0x40, g: 0x91, b: 0x6c, a: 255 };
const WHITE = { r: 255, g: 255, b: 255, a: 255 };
const TRANSPARENT = { r: 0, g: 0, b: 0, a: 0 };

function createPng(size, fill = TRANSPARENT) {
  const png = new PNG({ width: size, height: size });
  for (let i = 0; i < png.data.length; i += 4) {
    png.data[i] = fill.r;
    png.data[i + 1] = fill.g;
    png.data[i + 2] = fill.b;
    png.data[i + 3] = fill.a;
  }
  return png;
}

function setPixel(png, x, y, color) {
  const xi = Math.round(x);
  const yi = Math.round(y);
  if (xi < 0 || yi < 0 || xi >= png.width || yi >= png.height) return;
  const idx = (png.width * yi + xi) << 2;
  const srcA = color.a / 255;
  const dstA = png.data[idx + 3] / 255;
  const outA = srcA + dstA * (1 - srcA);
  if (outA <= 0) return;
  const blend = (src, dst) => Math.round((src * srcA + dst * dstA * (1 - srcA)) / outA);
  png.data[idx] = blend(color.r, png.data[idx]);
  png.data[idx + 1] = blend(color.g, png.data[idx + 1]);
  png.data[idx + 2] = blend(color.b, png.data[idx + 2]);
  png.data[idx + 3] = Math.round(outA * 255);
}

function fillCircle(png, cx, cy, radius, color) {
  const r2 = radius * radius;
  const minX = Math.max(0, Math.floor(cx - radius - 1));
  const maxX = Math.min(png.width - 1, Math.ceil(cx + radius + 1));
  const minY = Math.max(0, Math.floor(cy - radius - 1));
  const maxY = Math.min(png.height - 1, Math.ceil(cy + radius + 1));
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const dx = x + 0.5 - cx;
      const dy = y + 0.5 - cy;
      const d2 = dx * dx + dy * dy;
      if (d2 <= r2) {
        setPixel(png, x, y, color);
      } else if (d2 <= (radius + 0.85) * (radius + 0.85)) {
        const edge = Math.max(0, 1 - (Math.sqrt(d2) - radius));
        setPixel(png, x, y, { ...color, a: Math.round(color.a * edge) });
      }
    }
  }
}

function strokeCircle(png, cx, cy, radius, color, thickness = 2) {
  const outer = radius + thickness / 2;
  const inner = Math.max(0, radius - thickness / 2);
  const minX = Math.max(0, Math.floor(cx - outer - 1));
  const maxX = Math.min(png.width - 1, Math.ceil(cx + outer + 1));
  const minY = Math.max(0, Math.floor(cy - outer - 1));
  const maxY = Math.min(png.height - 1, Math.ceil(cy + outer + 1));
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const dx = x + 0.5 - cx;
      const dy = y + 0.5 - cy;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d <= outer && d >= inner) setPixel(png, x, y, color);
    }
  }
}

function fillPolygon(png, points, color) {
  const xs = points.map((p) => p[0]);
  const ys = points.map((p) => p[1]);
  const minX = Math.max(0, Math.floor(Math.min(...xs)));
  const maxX = Math.min(png.width - 1, Math.ceil(Math.max(...xs)));
  const minY = Math.max(0, Math.floor(Math.min(...ys)));
  const maxY = Math.min(png.height - 1, Math.ceil(Math.max(...ys)));
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      let inside = false;
      for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
        const xi = points[i][0];
        const yi = points[i][1];
        const xj = points[j][0];
        const yj = points[j][1];
        const intersect =
          yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi + 1e-9) + xi;
        if (intersect) inside = !inside;
      }
      if (inside) setPixel(png, x, y, color);
    }
  }
}

function drawLine(png, x1, y1, x2, y2, color, thickness) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.sqrt(dx * dx + dy * dy) || 1;
  const steps = Math.ceil(dist);
  for (let s = 0; s <= steps; s++) {
    const t = s / steps;
    fillCircle(png, x1 + dx * t, y1 + dy * t, thickness / 2, color);
  }
}

function drawSoccerMark(png, cx, cy, radius, seamColor) {
  fillCircle(png, cx, cy, radius, WHITE);
  strokeCircle(png, cx, cy, radius, seamColor, Math.max(3, radius * 0.045));

  const pr = radius * 0.32;
  const pent = [];
  for (let i = 0; i < 5; i++) {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
    pent.push([cx + Math.cos(a) * pr, cy + Math.sin(a) * pr]);
  }
  fillPolygon(png, pent, seamColor);

  const lineW = Math.max(3, radius * 0.055);
  for (let i = 0; i < 5; i++) {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
    const x1 = cx + Math.cos(a) * (pr * 0.95);
    const y1 = cy + Math.sin(a) * (pr * 0.95);
    const x2 = cx + Math.cos(a) * (radius * 0.9);
    const y2 = cy + Math.sin(a) * (radius * 0.9);
    drawLine(png, x1, y1, x2, y2, seamColor, lineW);

    // Hex-ish side patches near the rim
    const a2 = a + Math.PI / 5;
    const hx = cx + Math.cos(a2) * (radius * 0.62);
    const hy = cy + Math.sin(a2) * (radius * 0.62);
    strokeCircle(png, hx, hy, radius * 0.14, seamColor, Math.max(2, radius * 0.035));
  }
}

function writePng(png, filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, PNG.sync.write(png));
  console.log('wrote', filePath, png.width + 'x' + png.height);
}

function main() {
  const imagesDir = path.join(__dirname, '..', 'assets', 'images');

  const icon = createPng(1024, BRAND);
  drawSoccerMark(icon, 512, 512, 340, BRAND);
  strokeCircle(icon, 512, 512, 430, ACCENT, 20);
  writePng(icon, path.join(imagesDir, 'icon.png'));

  const splash = createPng(512, TRANSPARENT);
  drawSoccerMark(splash, 256, 256, 180, BRAND);
  writePng(splash, path.join(imagesDir, 'splash-icon.png'));

  const fg = createPng(1024, TRANSPARENT);
  drawSoccerMark(fg, 512, 512, 290, BRAND);
  writePng(fg, path.join(imagesDir, 'android-icon-foreground.png'));

  const bg = createPng(1024, BRAND);
  writePng(bg, path.join(imagesDir, 'android-icon-background.png'));

  const mono = createPng(1024, TRANSPARENT);
  drawSoccerMark(mono, 512, 512, 290, WHITE);
  // For monochrome, fill ball white then cut seams transparent-ish by redrawing white-only silhouette
  writePng(mono, path.join(imagesDir, 'android-icon-monochrome.png'));

  const fav = createPng(48, BRAND);
  drawSoccerMark(fav, 24, 24, 16, BRAND);
  writePng(fav, path.join(imagesDir, 'favicon.png'));
}

main();
