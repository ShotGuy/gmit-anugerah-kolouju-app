import sharp from 'sharp';
import multer from 'multer';
import { uploadFileToS3, generateFileName } from '@/lib/s3';

// Konfigurasi multer untuk memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per file
  },
  fileFilter: (req, file, cb) => {
    // Hanya allow image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

// Disable body parser untuk multer
export const config = {
  api: {
    bodyParser: false,
  },
};

const apiResponse = (success, data = null, message = "", errors = null) => {
  return {
    success,
    data,
    message,
    errors,
    timestamp: new Date().toISOString(),
  };
};

export default function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res
      .status(405)
      .json(apiResponse(false, null, `Method ${req.method} not allowed`));
  }

  // Run multer
  upload.array('photos', 10)(req, res, async (err) => {
    if (err) {
      console.error('Multer error:', err);
      return res.status(400).json(
        apiResponse(false, null, 'Upload error', err.message)
      );
    }

    try {
      const files = req.files;
      
      if (!files || files.length === 0) {
        return res.status(400).json(
          apiResponse(false, null, 'Validasi gagal', 'No files uploaded')
        );
      }

      const uploadPromises = files.map(async (file) => {
        // Compress and convert image to WebP
        const processedImage = await sharp(file.buffer)
          .resize(1920, 1080, {
            fit: 'inside',
            withoutEnlargement: true,
          })
          .webp({ 
            quality: 80,           // Quality for lossy compression
            effort: 4,             // Balance between speed and compression
            alphaQuality: 85,      // Quality for alpha channel if present
          })
          .toBuffer();

        const fileName = generateFileName(file.originalname, 'webp');
        const uploadResult = await uploadFileToS3(processedImage, fileName, 'image/webp');

        if (!uploadResult.success) {
          throw new Error(`Failed to upload ${file.originalname}: ${uploadResult.error}`);
        }

        // Get original and processed file sizes for comparison
        const originalSize = file.buffer.length;
        const processedSize = processedImage.length;
        const compressionRatio = Math.round(((originalSize - processedSize) / originalSize) * 100);

        return {
          originalName: file.originalname,
          fileName: fileName,
          url: uploadResult.url,
          size: processedImage.length,
          originalSize: originalSize,
          mimetype: 'image/webp',
          compressionRatio: compressionRatio,
          processed: true,
        };
      });

      const uploadedFiles = await Promise.all(uploadPromises);

      return res.status(200).json(
        apiResponse(
          true,
          { 
            files: uploadedFiles,
            totalFiles: uploadedFiles.length 
          },
          `${uploadedFiles.length} foto berhasil diupload`
        )
      );

    } catch (error) {
      console.error('Upload error:', error);
      return res.status(500).json(
        apiResponse(
          false,
          null,
          'Gagal mengupload foto',
          error.message
        )
      );
    }
  });
}