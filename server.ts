import express from "express";
import http from "http";
import path from "path";
import dns from "dns";
import { WebSocketServer } from "ws";
import dotenv from "dotenv";
import { EnvHttpProxyAgent, setGlobalDispatcher } from "undici";
import authRoutes from "./src/backend/routes/authRoutes";
import documentRoutes from "./src/backend/routes/documentRoutes";
import studyRoutes from "./src/backend/routes/studyRoutes";
import guideRoutes from "./src/backend/routes/guideRoutes";
import pyqRoutes from "./src/backend/routes/pyqRoutes";
import podcastRoutes from "./src/backend/routes/podcastRoutes";
import { registerWebSocketUpgrade, registerWebSocketHandlers } from "./src/backend/routes/wsRoutes";

// Load environment variables
dotenv.config();

// Ensure fast, reliable Google API resolution by prioritizing IPv4 over container IPv6 virtualization
try {
  dns.setDefaultResultOrder("ipv4first");
} catch (_) {}

console.log(`[Diagnostic] HTTP_PROXY: ${process.env.HTTP_PROXY || process.env.http_proxy || "none"}, HTTPS_PROXY: ${process.env.HTTPS_PROXY || process.env.https_proxy || "none"}`);

// Override Node global dispatcher with EnvHttpProxyAgent ONLY if proxy variables are actively defined
if (process.env.HTTP_PROXY || process.env.http_proxy || process.env.HTTPS_PROXY || process.env.https_proxy) {
  const globalAgent = new EnvHttpProxyAgent({
    headersTimeout: 300000,
    bodyTimeout: 300000,
    connectTimeout: 300000,
  });
  setGlobalDispatcher(globalAgent);
}

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ limit: "25mb", extended: true }));

// Gracefully handle "Payload Too Large" errors without dropping connection
app.use((err: any, req: any, res: any, next: any) => {
  if (err && (err.status === 413 || err.type === "entity.too.large")) {
    console.error("[REST Server] Payload too large error caught:", err);
    return res.status(413).json({
      success: false,
      error: "File is too large! Please upload a syllabus document smaller than 12MB to avoid network and server limits."
    });
  }
  next(err);
});

// Mount Modular API Routes
app.use(authRoutes);
app.use(documentRoutes);
app.use(studyRoutes);
app.use(guideRoutes);
app.use(pyqRoutes);
app.use(podcastRoutes);

// Create HTTP server
const server = http.createServer(app);
server.setTimeout(300000); // 5 minutes timeout for heavy multimodal AI parsing
server.keepAliveTimeout = 65000;
server.headersTimeout = 66000;

// Create WebSocket server attached to HTTP server (not listening on a separate port)
const wss = new WebSocketServer({ noServer: true });
const wssConcierge = new WebSocketServer({ noServer: true });
const wssKiaraLive = new WebSocketServer({ noServer: true });
const wssGuideLive = new WebSocketServer({ noServer: true });

// Attach Upgrade Handler and Connection Listeners via Modular wsRoutes
registerWebSocketUpgrade(server, { wss, wssConcierge, wssKiaraLive, wssGuideLive });
registerWebSocketHandlers({ wss, wssConcierge, wssKiaraLive, wssGuideLive });

// Setup Vite Dev Server / Static Asset delivery
async function startViteMiddleware() {
  if (process.env.NODE_ENV !== "production") {
    console.log("[Server] Mounting Vite developer middleware...");
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("[Server] Serving production static files...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }
  
  // Start server
  server.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] Voice AI Assistant server running on http://0.0.0.0:${PORT}`);
  });
}

startViteMiddleware().catch((err) => {
  console.error("[Server] Error during Vite middleware startup:", err);
});
