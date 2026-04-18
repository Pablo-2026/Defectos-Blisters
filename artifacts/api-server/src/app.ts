import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";
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
  }),
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
app.use("/api/uploads", express.static(uploadDir));

app.use("/api", router);

// Serve frontend static files (built by baliarda-blisters)
// pnpm runs start from artifacts/api-server/, so go one level up to artifacts/
const clientDistPath = path.join(process.cwd(), "..", "baliarda-blisters", "dist", "public");
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  // SPA fallback: send index.html for any non-API route
  app.use((_req, res) => {
    res.sendFile(path.join(clientDistPath, "index.html"));
  });
} else {
  app.get("/", (_req, res) => {
    res.json({ status: "ok", message: "API running. Frontend not built." });
  });
}

export default app;
