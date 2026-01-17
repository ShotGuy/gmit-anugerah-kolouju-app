import sharp from "sharp";

/**
 * Compress and convert image to WebP format
 * @param {Buffer} imageBuffer - The original image buffer
 * @param {Object} options - Compression options
 * @param {number} [options.quality=80] - JPEG quality (0-100)
 * @param {number} [options.maxWidth=1920] - Maximum width of the image
 * @param {number} [options.maxHeight=1080] - Maximum height of the image
 * @returns {Promise<{buffer: Buffer, info: Object}>} - Processed image buffer and info
 */
export const compressAndConvertImage = async (imageBuffer, options = {}) => {
  const {
    quality = 80, // Default quality: 80% (good balance of size and quality)
    maxWidth = 1920, // Default max width: 1920px
    maxHeight = 1080, // Default max height: 1080px
  } = options;

  try {
    // Get original image info
    const originalInfo = await sharp(imageBuffer).metadata();

    // Calculate dimensions preserving aspect ratio
    let { width, height } = originalInfo;

    // If image is larger than max dimensions, resize it while preserving aspect ratio
    if (width > maxWidth || height > maxHeight) {
      const ratio = Math.min(maxWidth / width, maxHeight / height);

      width = Math.round(width * ratio);
      height = Math.round(height * ratio);
    }

    // Process the image: resize and convert to WebP
    const processedBuffer = await sharp(imageBuffer)
      .resize(width, height, {
        fit: "inside",
        withoutEnlargement: true, // Don't enlarge smaller images
      })
      .webp({
        quality: quality, // Quality for lossy compression
        effort: 4, // Balance between speed and compression
        alphaQuality: 85, // Quality for alpha channel if present
      })
      .toBuffer();

    // Get info about the processed image
    const processedInfo = await sharp(processedBuffer).metadata();

    return {
      buffer: processedBuffer,
      info: {
        original: {
          width: originalInfo.width,
          height: originalInfo.height,
          size: imageBuffer.length,
          format: originalInfo.format,
        },
        processed: {
          width: processedInfo.width,
          height: processedInfo.height,
          size: processedBuffer.length,
          format: processedInfo.format, // will be 'webp'
        },
      },
    };
  } catch (error) {
    console.error("Error processing image:", error);
    throw new Error(`Image processing failed: ${error.message}`);
  }
};

/**
 * Calculate compression ratio
 * @param {number} originalSize - Original size in bytes
 * @param {number} compressedSize - Compressed size in bytes
 * @returns {number} - Compression ratio as percentage (0-100)
 */
export const calculateCompressionRatio = (originalSize, compressedSize) => {
  if (originalSize === 0) return 0;

  return Math.round(((originalSize - compressedSize) / originalSize) * 100);
};

export default {
  compressAndConvertImage,
  calculateCompressionRatio,
};
