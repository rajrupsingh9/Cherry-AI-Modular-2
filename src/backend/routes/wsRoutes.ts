import type * as http from "http";
import { WebSocketServer } from "ws";
import { attachConciergeSocket } from "../websocket/conciergeSocket";
import { attachKiaraSocket } from "../websocket/kiaraSocket";
import { attachGuideSocket } from "../websocket/guideSocket";
import { attachCherrySocket } from "../websocket/cherrySocket";

export interface WebSocketServers {
  wss: WebSocketServer;
  wssConcierge: WebSocketServer;
  wssKiaraLive: WebSocketServer;
  wssGuideLive: WebSocketServer;
}

/**
 * Registers HTTP 'upgrade' event routing to delegate WebSocket connections
 * to the appropriate WebSocketServer based on pathname.
 */
export function registerWebSocketUpgrade(server: http.Server, servers: WebSocketServers): void {
  server.on("upgrade", (request, socket, head) => {
    const host = request.headers.host || "localhost";
    const pathname = request.url ? new URL(request.url, `http://${host}`).pathname : "";

    if (pathname === "/api/live") {
      servers.wss.handleUpgrade(request, socket, head, (ws) => {
        servers.wss.emit("connection", ws, request);
      });
    } else if (pathname === "/api/concierge") {
      servers.wssConcierge.handleUpgrade(request, socket, head, (ws) => {
        servers.wssConcierge.emit("connection", ws, request);
      });
    } else if (pathname === "/api/kiara-live") {
      servers.wssKiaraLive.handleUpgrade(request, socket, head, (ws) => {
        servers.wssKiaraLive.emit("connection", ws, request);
      });
    } else if (pathname === "/api/guide-live") {
      servers.wssGuideLive.handleUpgrade(request, socket, head, (ws) => {
        servers.wssGuideLive.emit("connection", ws, request);
      });
    } else {
      socket.destroy();
    }
  });
}

/**
 * Attaches all WebSocket connection handlers (Concierge, Kiara, Guide, and Cherry Classroom)
 * to their respective WebSocketServer instances.
 */
export function registerWebSocketHandlers(servers: WebSocketServers): void {
  attachConciergeSocket(servers.wssConcierge);
  attachKiaraSocket(servers.wssKiaraLive);
  attachGuideSocket(servers.wssGuideLive);
  attachCherrySocket(servers.wss);
}
