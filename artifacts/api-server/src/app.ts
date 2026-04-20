import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes/index.js";
import { logger } from "./lib/logger.js";
import path from "path";
import fs from "fs";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  })
);

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Redirección de imágenes a Cloudinary
app.use("/api/uploads", (req, res) => {
  res.status(404).json({ error: "Usa Cloudinary para las imágenes" });
});

app.use("/api", router);

// Servir archivos del frontend
const clientDistPath = path.join(process.cwd(), "..", "baliarda-blisters", "dist", "public");
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.use((_req, res) => {
    res.sendFile(path.join(clientDistPath, "index.html"));
  });
} else {
  app.get("/", (_req, res) => {
    res.json({ status: "ok", message: "API running. Frontend not built." });
  });
}

export default app;
