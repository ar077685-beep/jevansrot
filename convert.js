const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const dir = path.join(process.cwd(), 'public', 'products');

fs.readdirSync(dir).forEach(file => {
  if (file.endsWith('.jpg') || file.endsWith('.png') || file.endsWith('.jpeg')) {
    const filePath = path.join(dir, file);
    const parsed = path.parse(filePath);
    const newFilePath = path.join(dir, parsed.name + '.webp');
    
    sharp(filePath)
      .webp({ quality: 80 })
      .toFile(newFilePath)
      .then(() => {
        console.log('Converted ' + file + ' to ' + parsed.name + '.webp');
      })
      .catch(err => {
        console.error('Error converting ' + file, err);
      });
  }
});

const tsFile = path.join(process.cwd(), 'src', 'data', 'products.ts');
let tsContent = fs.readFileSync(tsFile, 'utf8');
tsContent = tsContent.replace(/\.jpg/g, '.webp').replace(/\.png/g, '.webp');
fs.writeFileSync(tsFile, tsContent);
console.log('Updated products.ts');
