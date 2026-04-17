import { Router } from "express";
import { UploadPhotoBody } from "@workspace/api-zod";
import path from "path";
import fs from "fs";

const router = Router();

const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

router.post("/photos", async (req, res) => {
  const parsed = UploadPhotoBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body", details: parsed.error.issues });
    return;
  }

  const { data: base64Data, mimeType } = parsed.data;

  const ext = mimeType.includes("png") ? "png" : mimeType.includes("gif") ? "gif" : "jpg";
  const filename = `photo-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const filePath = path.join(uploadDir, filename);

  const buffer = Buffer.from(base64Data, "base64");
  fs.writeFileSync(filePath, buffer);

  const url = `/api/uploads/${filename}`;
  res.status(201).json({ url });
});

export default router;
