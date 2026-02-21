import { Polar } from "@polar-sh/sdk";
import { validateEvent, WebhookVerificationError } from "@polar-sh/sdk/webhooks";
import type { Express, Request, Response } from "express";
import express from "express";

let polarClient: Polar | null = null;

function getPolarClient(): Polar {
  if (!polarClient) {
    const accessToken = process.env.POLAR_ACCESS_TOKEN;
    if (!accessToken) {
      throw new Error("POLAR_ACCESS_TOKEN is not configured");
    }
    polarClient = new Polar({
      accessToken,
      server: process.env.POLAR_ENV === "production" ? "production" : "sandbox",
    });
  }
  return polarClient;
}

export function setupPolarRoutes(app: Express) {
  app.post("/api/polar/checkout", async (req: Request, res: Response) => {
    try {
      const polar = getPolarClient();
      const { productId, customerEmail, successUrl, metadata } = req.body;

      if (!productId) {
        return res.status(400).json({ error: "productId is required" });
      }

      const checkout = await polar.checkouts.create({
        products: [productId],
        customerEmail: customerEmail || undefined,
        successUrl: successUrl || undefined,
        metadata: metadata || undefined,
      });

      return res.json({
        checkoutId: checkout.id,
        checkoutUrl: checkout.url,
      });
    } catch (error: any) {
      console.error("Polar checkout error:", error?.message || error);
      return res.status(500).json({ error: "Failed to create checkout session" });
    }
  });

  app.get("/api/polar/products", async (_req: Request, res: Response) => {
    try {
      const polar = getPolarClient();
      const result = await polar.products.list({ limit: 100 });
      const items: any[] = [];
      for await (const page of result) {
        items.push(...(page.result?.items || []));
      }
      return res.json({ products: items });
    } catch (error: any) {
      console.error("Polar products error:", JSON.stringify({ message: error?.message, statusCode: error?.statusCode, body: error?.body }));
      return res.status(500).json({ error: "Failed to fetch products", detail: error?.message });
    }
  });

  app.get("/api/polar/subscription/:id", async (req: Request, res: Response) => {
    try {
      const polar = getPolarClient();
      const subId = req.params.id as string;
      const subscription = await polar.subscriptions.get({ id: subId });
      return res.json({ subscription });
    } catch (error: any) {
      console.error("Polar subscription error:", error?.message || error);
      return res.status(500).json({ error: "Failed to fetch subscription" });
    }
  });

  app.post("/api/polar/subscription/:id/cancel", async (req: Request, res: Response) => {
    try {
      const polar = getPolarClient();
      const cancelId = req.params.id as string;
      const updated = await polar.subscriptions.update({
        id: cancelId,
        subscriptionUpdate: { cancelAtPeriodEnd: true },
      });
      return res.json({ subscription: updated });
    } catch (error: any) {
      console.error("Polar cancel error:", error?.message || error);
      return res.status(500).json({ error: "Failed to cancel subscription" });
    }
  });

  app.post(
    "/api/polar/webhook",
    express.raw({ type: "application/json" }),
    async (req: Request, res: Response) => {
      const webhookSecret = process.env.POLAR_WEBHOOK_SECRET;
      if (!webhookSecret) {
        console.error("POLAR_WEBHOOK_SECRET not configured");
        return res.sendStatus(500);
      }

      try {
        const signature = req.headers["webhook-signature"] as string;
        const body = typeof req.body === "string" ? req.body : req.body.toString();
        const event = validateEvent(body, Object.fromEntries(
          Object.entries(req.headers).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v || ""])
        ), webhookSecret);

        console.log(`Polar webhook: ${event.type}`);

        switch (event.type) {
          case "checkout.updated":
            console.log("Checkout updated:", event.data.id, "status:", event.data.status);
            break;
          case "subscription.created":
            console.log("New subscription:", event.data.id);
            break;
          case "subscription.updated":
            console.log("Subscription updated:", event.data.id, "status:", event.data.status);
            break;
          case "order.paid":
            console.log("Order paid:", event.data.id);
            break;
          default:
            console.log("Unhandled polar event:", event.type);
        }

        return res.sendStatus(200);
      } catch (error) {
        if (error instanceof WebhookVerificationError) {
          console.error("Webhook signature verification failed");
          return res.sendStatus(403);
        }
        console.error("Webhook processing error:", error);
        return res.sendStatus(500);
      }
    }
  );
}
