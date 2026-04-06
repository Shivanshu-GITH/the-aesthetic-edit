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
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
  });
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

    // Upload to Cloudinary using buffer
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
    
    const cloud = getCloudinary();
    const result = await cloud.uploader.upload(dataURI, {
      folder: 'aesthetic-edit',
      resource_type: 'auto'
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

export default router;
