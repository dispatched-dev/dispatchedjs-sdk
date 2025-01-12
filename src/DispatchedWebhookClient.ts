import type { WebhookClientConfig, WebhookPayload } from "./types";

/**
 *
 */
export class DispatchedWebhookClient {
  private readonly webhookSecret: string;

  constructor(config: WebhookClientConfig) {
    this.webhookSecret = config.webhookSecret;
  }

  /**
   * Verify and extract payload incoming webhook requests
   * @param authorization - The Authorization header from the webhook request
   * @param rawBody - The raw request body as string
   * @throws Error if authentication fails
   */
  async getVerifiedPayload<T = any>(
    authorization: string | null,
    rawBody: string
  ): Promise<WebhookPayload<T>> {
    if (!this.isAuthValid(authorization)) {
      throw new Error("Invalid webhook signature");
    }
    if (!rawBody) {
      throw new Error("Invalid webhook payload");
    }

    try {
      // Parse and validate payload
      const payload = JSON.parse(rawBody) as WebhookPayload<T>;

      // Validate required fields
      if (
        !payload.jobId ||
        !payload.attempt ||
        !payload.attemptNumber ||
        !payload.payload
      ) {
        throw new Error("Invalid webhook payload structure");
      }

      return payload;
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error("Invalid webhook payload");
      }
      throw error;
    }
  }

  private isAuthValid(authorization: string | null): boolean {
    if (!authorization) {
      return false;
    }
    authorization = authorization.trim();
    if (!authorization) {
      return false;
    }
    return (
      authorization === `Bearer ${this.webhookSecret}` ||
      authorization === this.webhookSecret
    );
  }
}
