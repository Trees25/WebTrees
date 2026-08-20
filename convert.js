import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const imgDir = path.join(__dirname, 'img');
const assetsDir = path.join(__dirname, 'src', 'assets');

async function convertImages() {
  const files = fs.readdirSync(imgDir);
  for (const file of files) {
    if (file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg')) {
      const name = path.parse(file).name;
      const inputPath = path.join(imgDir, file);
      const outputPath = path.join(assetsDir, `${name}.webp`);
      
      console.log(`Converting ${file} to ${name}.webp...`);
      await sharp(inputPath)
        .webp({ quality: 80 })
        .toFile(outputPath);
    }
  }
  console.log("All images converted.");
}

convertImages().catch(console.error);
