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
    
    // Sample the background color from top-left pixel (0, 0)
    const bgIndex = image.getPixelIndex(0, 0);
    const bgRed = image.bitmap.data[bgIndex];
    const bgGreen = image.bitmap.data[bgIndex + 1];
    const bgBlue = image.bitmap.data[bgIndex + 2];
    
    const tolerance = 25; // Tolerance for color difference

    // Replace background with transparent
    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
      const red = this.bitmap.data[idx];
      const green = this.bitmap.data[idx + 1];
      const blue = this.bitmap.data[idx + 2];
      
      // Calculate color distance
      const distRed = Math.abs(red - bgRed);
      const distGreen = Math.abs(green - bgGreen);
      const distBlue = Math.abs(blue - bgBlue);
      
      // If the pixel is similar to the background color
      if (distRed <= tolerance && distGreen <= tolerance && distBlue <= tolerance) {
        this.bitmap.data[idx + 3] = 0; // Alpha channel to 0 (transparent)
      }
    });

    image.write(outputPath);
    console.log('Image processed successfully:', outputPath);
  } catch (error) {
    console.error('Error processing image:', error);
  }
}

removeBackground();
