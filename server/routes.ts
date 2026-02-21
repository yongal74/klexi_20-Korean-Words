import type { Express } from "express";
import { createServer, type Server } from "node:http";
import { setupPolarRoutes } from "./polar";

export async function registerRoutes(app: Express): Promise<Server> {
  setupPolarRoutes(app);

  const httpServer = createServer(app);

  return httpServer;
}
