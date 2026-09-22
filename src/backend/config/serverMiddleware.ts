import express, { Express } from "express";
import http from "http";
import path from "path";
import dns from "dns";
import { EnvHttpProxyAgent, setGlobalDispatcher } from "undici";

/**
 * Configures network DNS resolution and HTTP proxy dispatchers.
 */
export function setupNetworkEnvironment(): void {
  try {
    dns.setDefaultResultOrder("ipv4first");
  } catch (_) {}

  if (process.env.HTTP_PROXY || process.env.http_proxy || process.env.HTTPS_PROXY || process.env.https_proxy) {
    const globalAgent = new EnvHttpProxyAgent({
      headersTimeout: 300000,
      bodyTimeout: 300000,
      connectTimeout: 300000,
    });
    setGlobalDispatcher(globalAgent);
  }
}

/**
 * Mounts standard express parsers and payload error handlers.
 */
export function setupExpressParsers(app: Express): void {
  app.use(express.json({ limit: "25mb" }));
  app.use(express.urlencoded({ limit: "25mb", extended: true }));

  app.use((err: any, req: any, res: any, next: any) => {
    if (err && (err.status === 413 || err.type === "entity.too.large")) {
      console.error("[REST Server] Payload too large error caught:", err);
      return res.status(413).json({
        success: false,
        error: "File is too large! Please upload a syllabus document smaller than 12MB to avoid network and server limits.",
      });
    }
    next(err);
  });
}

/**
 * Mounts Vite development middleware or production static asset delivery.
 */
export async function mountViteOrStatic(app: Express, server: http.Server, port: number): Promise<void> {
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

  server.listen(port, "0.0.0.0", () => {
    console.log(`[Server] Voice AI Assistant server running on http://0.0.0.0:${port}`);
  });
}
