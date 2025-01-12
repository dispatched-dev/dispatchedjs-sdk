import express, { Express, Request, Response } from "express";
import crypto from "crypto";

interface ServerConfig {
  webhookSecret: string;
  webhookUrl: string;
  port: number;
}

export class Server {
  private app: Express;
  private config: ServerConfig;

  constructor(config: ServerConfig) {
    this.app = express();
    this.config = config;
    this.setupMiddleware();
    this.setupWebhook();
  }

  private setupMiddleware(): void {
    this.app.use(express.json());
  }

  private validateSignature(signature: string, body: any): boolean {
    const hmac = crypto.createHmac("sha256", this.config.webhookSecret);
    const computedSignature = hmac.update(JSON.stringify(body)).digest("hex");
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(computedSignature)
    );
  }
  private setupWebhook(): void {
    this.app.post("/", (req: Request, res: Response) => {
      const signature = req.headers["Authorization"] as string;
      const token = signature?.split(" ")[1];

      if (!token) {
        return res.status(401).json({ error: "No signature provided" });
      }

      try {
        if (!this.validateSignature(token, req.body)) {
          return res.status(401).json({ error: "Invalid signature" });
        }

        // Forward the webhook to the specified URL
        fetch(this.config.webhookUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(req.body),
        })
          .then((response) => response.json())
          .then(() => {
            res.json({ success: true });
          })
          .catch((error) => {
            console.error("Error forwarding webhook:", error);
            res.status(500).json({ error: "Failed to forward webhook" });
          });
      } catch (error) {
        console.error("Error processing webhook:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    });
  }

  listen(): void {
    this.app.listen(this.config.port, () => {
      console.log(`🚀 Webhook server running on port ${this.config.port}`);
      console.log(`📮 Forwarding webhooks to: ${this.config.webhookUrl}`);
      console.log(
        `🔒 Validating webhooks with secret: ${this.config.webhookSecret.slice(
          0,
          3
        )}...`
      );
    });
  }
}
