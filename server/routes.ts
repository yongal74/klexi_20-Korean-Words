import type { Express } from "express";
import { createServer, type Server } from "node:http";
import { setupPolarRoutes } from "./polar";
import { setupAIChatRoutes } from "./ai-chat";

export async function registerRoutes(app: Express): Promise<Server> {
  setupPolarRoutes(app);
  setupAIChatRoutes(app);

  const httpServer = createServer(app);

  return httpServer;
}
