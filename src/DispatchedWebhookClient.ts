import type { WebhookClientConfig, WebhookPayload } from "./types";

export class DispatchedWebhookClient {
  private readonly webhookSecret: string;
  private readonly debug: boolean;

  constructor(config: WebhookClientConfig) {
    this.webhookSecret = config.webhookSecret;
    this.debug = config.debug || false;
  }

  /**
   * Verify and extract payload incoming webhook requests
   * @param authorization - The Authorization header from the webhook request
   * @param rawBody - The raw request body as string
   * @throws Error if authentication fails
   */
  async getVerifiedPayload<T = any>(
    authorization: string | null | undefined,
    rawBody: any
  ): Promise<WebhookPayload<T>> {
    if (this.debug) {
        console.log("getVerifiedPayload()", {
          authorization,
          rawBody,
        });
    }
    if (!this.isAuthValid(authorization)) {
      const sanitizedAuth = this.getRedactedAuth(authorization);
      throw new Error(`Invalid webhook signature. Authorization: ${sanitizedAuth}`);
    }
    if (!rawBody) {
      throw new Error("Invalid webhook payload: empty body");
    }
    if (typeof rawBody !== "string") {
      throw new Error("Invalid webhook payload: body is not a string");
    }

    try {
      // Parse and validate payload
      const payload = JSON.parse(rawBody) as WebhookPayload<T>;

      // Validate required fields
      if (
        !payload.jobId ||
        !payload.attemptId ||
        !payload.attemptNumber ||
        !payload.payload
      ) {
        throw new Error(`Invalid webhook payload structure: ${JSON.stringify(payload)}`);
      }

      return payload;
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error("Invalid webhook payload: Invalid JSON body");
      }
      throw error;
    }
  }

  private isAuthValid(authorization?: string | null): boolean {
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

  private getRedactedAuth(authorization?: string|null): string {
    if (!authorization) {
      return "null";
    }
    // get last 4 characters of the token
    if (authorization.startsWith("Bearer")) {
      const token = authorization.split(" ")[1];
      return `Bearer ...${this.redactToken(token)}`;
    }
    return this.redactToken(authorization);
  }

  private redactToken(token: string): string {
    return token.slice(0, 4) + "..." + token.slice(-4);
  }
}
