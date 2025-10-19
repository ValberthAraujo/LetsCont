/*
  Optimize JPG/PNG images in src/assets/img by generating AVIF and WEBP
  Outputs files alongside originals: <name>.avif and <name>.webp
*/
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const IMAGES_DIR = path.resolve('src/assets/img');
const SUPPORTED = new Set(['.jpg', '.jpeg', '.png']);

async function ensureOptimized(file) {
  const ext = path.extname(file).toLowerCase();
  if (!SUPPORTED.has(ext)) return;

  const base = path.join(IMAGES_DIR, path.basename(file, ext));
  const src = path.join(IMAGES_DIR, file);
  const outAvif = `${base}.avif`;
  const outWebp = `${base}.webp`;

  const buffer = fs.readFileSync(src);

  // Skip if outputs exist and are newer than source
  const srcStat = fs.statSync(src);
  const needAvif = !fs.existsSync(outAvif) || fs.statSync(outAvif).mtimeMs < srcStat.mtimeMs;
  const needWebp = !fs.existsSync(outWebp) || fs.statSync(outWebp).mtimeMs < srcStat.mtimeMs;

  if (!needAvif && !needWebp) return;

  const image = sharp(buffer).rotate();
  const metadata = await image.metadata();
  // Limit size to reasonable width for web display
  const width = metadata.width || 1920;
  const targetWidth = Math.min(width, 1600);

  if (needAvif) {
    await image
      .resize({ width: targetWidth, withoutEnlargement: true })
      .avif({ quality: 50 })
      .toFile(outAvif);
    console.log('Gerado AVIF', path.basename(outAvif));
  }

  if (needWebp) {
    await image
      .resize({ width: targetWidth, withoutEnlargement: true })
      .webp({ quality: 70 })
      .toFile(outWebp);
    console.log('Gerado WEBP', path.basename(outWebp));
  }
}

async function run() {
  if (!fs.existsSync(IMAGES_DIR)) {
    console.error('Images folder not found:', IMAGES_DIR);
    process.exit(1);
  }
  const files = fs.readdirSync(IMAGES_DIR);
  for (const file of files) {
    try {
      await ensureOptimized(file);
    } catch (err) {
      console.error('Error optimizing', file, err.message);
    }
  }
}

run();

