import express from "express";
import http from "http";
import { WebSocketServer } from "ws";
import dotenv from "dotenv";
import authRoutes from "./src/backend/routes/authRoutes";
import documentRoutes from "./src/backend/routes/documentRoutes";
import studyRoutes from "./src/backend/routes/studyRoutes";
import guideRoutes from "./src/backend/routes/guideRoutes";
import pyqRoutes from "./src/backend/routes/pyqRoutes";
import podcastRoutes from "./src/backend/routes/podcastRoutes";
import { registerWebSocketUpgrade, registerWebSocketHandlers } from "./src/backend/routes/wsRoutes";
import { setupNetworkEnvironment, setupExpressParsers, mountViteOrStatic } from "./src/backend/config/serverMiddleware";

// Initialize environment & networking
dotenv.config();
setupNetworkEnvironment();

const app = express();
const PORT = 3000;

setupExpressParsers(app);

// Mount Modular API Routes
app.use(authRoutes);
app.use(documentRoutes);
app.use(studyRoutes);
app.use(guideRoutes);
app.use(pyqRoutes);
app.use(podcastRoutes);

// Create HTTP server
const server = http.createServer(app);
server.setTimeout(300000);
server.keepAliveTimeout = 65000;
server.headersTimeout = 66000;

// Create WebSocket servers
const wss = new WebSocketServer({ noServer: true });
const wssConcierge = new WebSocketServer({ noServer: true });
const wssKiaraLive = new WebSocketServer({ noServer: true });
const wssGuideLive = new WebSocketServer({ noServer: true });

// Attach Upgrade Handler and Connection Listeners
registerWebSocketUpgrade(server, { wss, wssConcierge, wssKiaraLive, wssGuideLive });
registerWebSocketHandlers({ wss, wssConcierge, wssKiaraLive, wssGuideLive });

// Mount Vite or static production asset delivery
mountViteOrStatic(app, server, PORT).catch((err) => {
  console.error("[Server] Error during Vite middleware startup:", err);
});

