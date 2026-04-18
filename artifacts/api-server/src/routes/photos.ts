import { Router } from "express";
import { UploadPhotoBody } from "@workspace/api-zod";
import { v2 as cloudinary } from "cloudinary";

const router = Router();

const cloudName = process.env["CLOUDINARY_CLOUD_NAME"];
const apiKey = process.env["CLOUDINARY_API_KEY"];
const apiSecret = process.env["CLOUDINARY_API_SECRET"];

const cloudinaryConfigured = !!(cloudName && apiKey && apiSecret);

if (cloudinaryConfigured) {
  cloudinary.config({
    cloud_name: cloudName!,
    api_key: apiKey!,
    api_secret: apiSecret!,
    secure: true,
  });
}

router.post("/photos", async (req, res) => {
  if (!cloudinaryConfigured) {
    res.status(503).json({
      error: "Cloudinary no configurado. Defina CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY y CLOUDINARY_API_SECRET.",
    });
    return;
  }

  const parsed = UploadPhotoBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Cuerpo inválido", details: parsed.error.issues });
    return;
  }

  const { data: base64Data, mimeType } = parsed.data;
  const dataUri = `data:${mimeType};base64,${base64Data}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    folder: "baliarda-defectos",
    resource_type: "image",
  });

  res.status(201).json({ url: result.secure_url });
});

export default router;
