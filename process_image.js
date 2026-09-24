import { Jimp } from 'jimp';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function removeBackground() {
  const inputPath = 'C:\\Users\\ASUS\\.gemini\\antigravity-ide\\brain\\593f42b5-4cfc-4c58-af04-494142323c51\\.user_uploaded\\media_1790254682145.png';
  const outputPath = path.join(__dirname, 'public', 'logo-eduevent.png');

  try {
    const image = await Jimp.read(inputPath);
    
    // Replace black background with transparent
    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
      const red = this.bitmap.data[idx];
      const green = this.bitmap.data[idx + 1];
      const blue = this.bitmap.data[idx + 2];
      
      // If the pixel is very dark (close to black)
      if (red < 30 && green < 30 && blue < 30) {
        this.bitmap.data[idx + 3] = 0; // Alpha channel to 0 (transparent)
      }
    });

    await image.write(outputPath);
    console.log('Image processed successfully:', outputPath);
  } catch (error) {
    console.error('Error processing image:', error);
  }
}

removeBackground();
