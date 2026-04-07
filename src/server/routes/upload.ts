import { Router } from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { rateLimit } from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { checkAdmin } from '../middleware/admin.js';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const router = Router();

// Configure Cloudinary explicitly with a function to ensure latest env vars
const getCloudinary = () => {
  const cloudinaryUrl = process.env.CLOUDINARY_URL;
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUD_NAME || '';
  const apiKey = process.env.CLOUDINARY_API_KEY || process.env.CLOUDINARY_KEY || process.env.API_KEY || '';
  const apiSecret = process.env.CLOUDINARY_API_SECRET || process.env.CLOUDINARY_SECRET || process.env.API_SECRET || '';

  if (cloudinaryUrl) {
    cloudinary.config({
      cloudinary_url: cloudinaryUrl,
      secure: true,
    });
    return cloudinary;
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true
  });

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Cloudinary config missing. Set CLOUDINARY_URL or CLOUDINARY_CLOUD_NAME/CLOUDINARY_API_KEY/CLOUDINARY_API_SECRET.');
  }
  return cloudinary;
};

// Multer setup (in-memory storage)
const storage = multer.memoryStorage();
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']; 

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => { 
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) { 
    cb(null, true); 
  } else { 
    cb(new Error('Only image files are allowed (JPEG, PNG, WebP, GIF)')); 
  } 
}; 

const upload = multer({ 
  storage, 
  limits: { fileSize: 5 * 1024 * 1024 }, 
  fileFilter, 
}); 

const GUIDE_ALLOWED_MIME_TYPES = ['application/pdf', 'application/x-pdf', 'application/octet-stream'];

const guideFileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const fileName = (file.originalname || '').toLowerCase();
  const hasPdfExtension = fileName.endsWith('.pdf');
  if (GUIDE_ALLOWED_MIME_TYPES.includes(file.mimetype) && hasPdfExtension) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'));
  }
};

const guideUpload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: guideFileFilter,
});

const uploadLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50, // limit each IP to 50 uploads per window
  message: { success: false, error: 'Too many upload requests, please try again later' },
});

router.post('/', uploadLimit, checkAdmin, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const cloud = getCloudinary();
    const result = await new Promise<any>((resolve, reject) => {
      const stream = cloud.uploader.upload_stream(
        {
          folder: 'aesthetic-edit',
          resource_type: 'image',
          timeout: 120000,
        },
        (error, uploaded) => {
          if (error) return reject(error);
          resolve(uploaded);
        }
      );
      stream.end(req.file!.buffer);
    });

    res.json({ 
      success: true, 
      url: result.secure_url,
      public_id: result.public_id 
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, error: error.message || 'Upload failed' });
  }
});

router.post('/guide', uploadLimit, checkAdmin, async (req, res) => {
  return res.status(410).json({
    success: false,
    error: 'Guide file uploads are disabled. Set a public HTTPS PDF URL in Admin > Site Config > Guide File URL.',
  });
});

export default router;
