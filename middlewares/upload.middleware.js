import { v2 as cloudinaryModule } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

cloudinaryModule.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Profile image storage
const Profilestorage = new CloudinaryStorage({
    cloudinary: cloudinaryModule,
    params: async (req, file) => ({
        folder: 'ChatVia/profile_pictures',
        public_id: req.user.id,
        allowed_formats: ['jpg', 'png', 'jpeg'],
        overwrite: true,
        resource_type: 'image',
    }),
});

export const uploadProfile = multer({ storage: Profilestorage });

// Photo / Video sharing storage
const Photostorage = new CloudinaryStorage({
    cloudinary: cloudinaryModule,
    params: async (req, file) => ({
        folder: 'ChatVia/Photos_sharing',
        allowed_formats: ['jpg', 'png', 'jpeg', 'mp4'],
        public_id: `${req.user.id}_${Date.now()}`,
        resource_type: file.mimetype.startsWith("video") ? "video" : "image",
    }),
});

export const uploadPhoto = multer({ storage: Photostorage });

// Docx sharing storage
const Docxstorage = new CloudinaryStorage({
    cloudinary: cloudinaryModule,
    params: async (req, file) => ({
        folder: 'ChatVia/Docx_File',
        public_id: `${req.user.id}_${Date.now()}`,
        resource_type: "raw",
        format: "docx"
    }),
});

export const uploadDocx = multer({ storage: Docxstorage });

// Pdf sharing storage
const Pdfstorage = new CloudinaryStorage({
    cloudinary: cloudinaryModule,
    params: async (req, file) => ({
        folder: 'ChatVia/Pdf_File',
        public_id: `${req.user.id}_${Date.now()}`,
        resource_type: "raw",
        format: "pdf"
    }),
});

export const uploadPdf = multer({ storage: Pdfstorage });
