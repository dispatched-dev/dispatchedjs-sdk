import { DispatchedWebhookClient } from "../DispatchedWebhookClient";
import type { WebhookPayload } from "../types";

describe("DispatchedWebhookClient", () => {
  const mockWebhookSecret = "test-webhook-secret";
  let client: DispatchedWebhookClient;

  beforeEach(() => {
    client = new DispatchedWebhookClient({ webhookSecret: mockWebhookSecret });
  });

  describe("verify", () => {
    const validPayload: WebhookPayload = {
      jobId: "123",
      attempt: "attempt-123",
      attemptNumber: 1,
      payload: { data: "test" },
    };

    it("should successfully verify valid webhook request", async () => {
      const rawBody = JSON.stringify(validPayload);
      const authorization = `Bearer ${mockWebhookSecret}`;

      const result = await client.verify(authorization, rawBody);

      expect(result).toEqual(validPayload);
    });

    it("should throw error for invalid webhook secret", async () => {
      const rawBody = JSON.stringify(validPayload);
      const authorization = "Bearer invalid-secret";

      await expect(client.verify(authorization, rawBody)).rejects.toThrow(
        "Invalid webhook signature"
      );
    });

    it("should throw error for missing authorization", async () => {
      const rawBody = JSON.stringify(validPayload);

      await expect(client.verify(null, rawBody)).rejects.toThrow(
        "Invalid webhook signature"
      );
    });

    it("should throw error for invalid JSON payload", async () => {
      const rawBody = "invalid-json";
      const authorization = `Bearer ${mockWebhookSecret}`;

      await expect(client.verify(authorization, rawBody)).rejects.toThrow(
        "Invalid JSON in webhook payload"
      );
    });

    it("should throw error for missing required fields", async () => {
      const invalidPayload = {
        jobId: "123",
        // Missing required fields
      };
      const rawBody = JSON.stringify(invalidPayload);
      const authorization = `Bearer ${mockWebhookSecret}`;

      await expect(client.verify(authorization, rawBody)).rejects.toThrow(
        "Invalid webhook payload structure"
      );
    });
  });
});
