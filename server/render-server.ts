/**
 * Render.com 本番サーバー
 * APIサーバー + Expo Webの静的ファイル配信を統合
 */
import "dotenv/config";
import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./_core/oauth";
import { appRouter } from "./routers";
import { createContext } from "./_core/context";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = createServer(app);

  // CORS設定
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin) {
      res.header("Access-Control-Allow-Origin", origin);
    }
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization",
    );
    res.header("Access-Control-Allow-Credentials", "true");
    if (req.method === "OPTIONS") {
      res.sendStatus(200);
      return;
    }
    next();
  });

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // OAuth routes
  registerOAuthRoutes(app);

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, timestamp: Date.now() });
  });

  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    }),
  );

  // Expo Web 静的ファイル配信
  const webDistPath = path.join(__dirname, "web");
  app.use(express.static(webDistPath));

  // SPA フォールバック（全ルートをindex.htmlに転送）
  app.get("*", (_req, res) => {
    res.sendFile(path.join(webDistPath, "index.html"));
  });

  const port = parseInt(process.env.PORT || "10000");
  server.listen(port, () => {
    console.log(`[render] server listening on port ${port}`);
  });
}

startServer().catch(console.error);
