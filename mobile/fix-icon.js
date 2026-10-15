const sharp = require('sharp');
const fs = require('fs');

// 1. Read the image from the assets folder into memory first
const imgBuffer = fs.readFileSync('./assets/adaptive-icon.png');

// 2. Process the image and overwrite the file safely
sharp(imgBuffer)
  .resize(682, 682)
  .extend({
    top: 171,
    bottom: 171,
    left: 171,
    right: 171,
    background: '#000000' // Black background to seamlessly match your image's corners
  })
  .toFile('./assets/adaptive-icon.png')
  .then(() => console.log('✅ Perfect Android icon generated at assets/adaptive-icon.png!'))
  .catch(err => console.error('Error generating icon:', err));