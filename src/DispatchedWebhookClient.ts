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
   * Verify and handle incoming webhook requests
   * @param authorization - The Authorization header from the webhook request
   * @param rawBody - The raw request body as string
   * @throws Error if authentication fails
   */
  async verify(
    authorization: string | null,
    rawBody: string
  ): Promise<WebhookPayload> {
    // Verify Authorization header
    if (!authorization || authorization !== `Bearer ${this.webhookSecret}`) {
      throw new Error("Invalid webhook signature");
    }

    try {
      // Parse and validate payload
      const payload = JSON.parse(rawBody) as WebhookPayload;

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
        throw new Error("Invalid JSON in webhook payload");
      }
      throw error;
    }
  }
}
