import { Router } from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

const router = Router();

// Configuración de Cloudinary con tus llaves de Render
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "defectos-blisters",
    allowed_formats: ["jpg", "png", "jpeg"],
  } as any,
});

const upload = multer({ storage: storage });

// Esta es la ruta exacta que activará la subida
router.post("/", upload.single("file"), (req: any, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No se pudo procesar la imagen" });
  }
  res.json({ url: req.file.path });
});

export default router;
