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

      const result = await client.getVerifiedPayload(authorization, rawBody);

      expect(result).toEqual(validPayload);
    });

    it("should successfully verify valid webhook request if the `Bearer` keyword is missing", async () => {
      const rawBody = JSON.stringify(validPayload);
      const authorization = `${mockWebhookSecret}`;

      const result = await client.getVerifiedPayload(authorization, rawBody);

      expect(result).toEqual(validPayload);
    });

    it("should throw error for invalid webhook secret", async () => {
      const rawBody = JSON.stringify(validPayload);
      const authorization = "Bearer invalid-secret";

      await expect(
        client.getVerifiedPayload(authorization, rawBody)
      ).rejects.toThrow("Invalid webhook signature");
    });

    it("should throw error for missing authorization", async () => {
      const rawBody = JSON.stringify(validPayload);

      await expect(client.getVerifiedPayload(null, rawBody)).rejects.toThrow(
        "Invalid webhook signature"
      );
    });

    it("should throw error for empty authorization", async () => {
      const rawBody = JSON.stringify(validPayload);

      await expect(client.getVerifiedPayload("", rawBody)).rejects.toThrow(
        "Invalid webhook signature"
      );
    });

    it("should throw error for whitespace authorization", async () => {
      const rawBody = JSON.stringify(validPayload);

      await expect(client.getVerifiedPayload("   ", rawBody)).rejects.toThrow(
        "Invalid webhook signature"
      );
    });

    it("should throw error for invalid JSON payload", async () => {
      const rawBody = "invalid-json";
      const authorization = `Bearer ${mockWebhookSecret}`;

      await expect(
        client.getVerifiedPayload(authorization, rawBody)
      ).rejects.toThrow("Invalid webhook payload: Invalid JSON body");
    });

    it("should throw error for empty body", async () => {
      const authorization = `Bearer ${mockWebhookSecret}`;

      await expect(
        client.getVerifiedPayload(authorization, "")
      ).rejects.toThrow("Invalid webhook payload: empty body");
    });

    it("should throw error for non-string body", async () => {
      const authorization = `Bearer ${mockWebhookSecret}`;

      await expect(
        client.getVerifiedPayload(authorization, { some: "object" })
      ).rejects.toThrow("Invalid webhook payload: body is not a string");
    });

    it("should throw error for missing required fields", async () => {
      const invalidPayload = {
        jobId: "123",
        // Missing required fields
      };
      const rawBody = JSON.stringify(invalidPayload);
      const authorization = `Bearer ${mockWebhookSecret}`;

      await expect(
        client.getVerifiedPayload(authorization, rawBody)
      ).rejects.toThrow("Invalid webhook payload structure");
    });

    it("should throw error for missing jobId", async () => {
      const invalidPayload = {
        attempt: "attempt-123",
        attemptNumber: 1,
        payload: { data: "test" },
      };
      const rawBody = JSON.stringify(invalidPayload);
      const authorization = `Bearer ${mockWebhookSecret}`;

      await expect(
        client.getVerifiedPayload(authorization, rawBody)
      ).rejects.toThrow("Invalid webhook payload structure");
    });

    it("should throw error for missing attempt", async () => {
      const invalidPayload = {
        jobId: "123",
        attemptNumber: 1,
        payload: { data: "test" },
      };
      const rawBody = JSON.stringify(invalidPayload);
      const authorization = `Bearer ${mockWebhookSecret}`;

      await expect(
        client.getVerifiedPayload(authorization, rawBody)
      ).rejects.toThrow("Invalid webhook payload structure");
    });

    it("should throw error for missing attemptNumber", async () => {
      const invalidPayload = {
        jobId: "123",
        attempt: "attempt-123",
        payload: { data: "test" },
      };
      const rawBody = JSON.stringify(invalidPayload);
      const authorization = `Bearer ${mockWebhookSecret}`;

      await expect(
        client.getVerifiedPayload(authorization, rawBody)
      ).rejects.toThrow("Invalid webhook payload structure");
    });

    it("should throw error for missing payload", async () => {
      const invalidPayload = {
        jobId: "123",
        attempt: "attempt-123",
        attemptNumber: 1,
      };
      const rawBody = JSON.stringify(invalidPayload);
      const authorization = `Bearer ${mockWebhookSecret}`;

      await expect(
        client.getVerifiedPayload(authorization, rawBody)
      ).rejects.toThrow("Invalid webhook payload structure");
    });
  });
});
