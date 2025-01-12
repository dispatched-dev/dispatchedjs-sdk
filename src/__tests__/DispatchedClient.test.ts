import { DispatchedClient } from "../DispatchedClient";
import { JobResponse, JobStatus } from "../types";

describe("DispatchedClient", () => {
  let client: DispatchedClient;
  const mockApiKey = "test-api-key";
  const mockBaseUrl = "http://test-api.com";

  beforeEach(() => {
    client = new DispatchedClient({
      apiKey: mockApiKey,
      baseUrl: mockBaseUrl,
    });
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("dispatchJob", () => {
    it("should successfully dispatch a job", async () => {
      const mockResponse: JobResponse = {
        jobId: "123",
        status: "QUEUED" as JobStatus,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const payload = { data: "test" };
      const result = await client.dispatchJob(payload);

      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/jobs/dispatch`,
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockApiKey}`,
            "Content-Type": "application/json",
          }),
          body: JSON.stringify({ payload }),
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it("should throw error for invalid payload", async () => {
      await expect(client.dispatchJob(null as any)).rejects.toThrow(
        "Invalid payload: must be a non-null object"
      );
    });
  });

  describe("getJobStatus", () => {
    it("should successfully get job status", async () => {
      const mockResponse: JobResponse = {
        jobId: "123",
        status: "COMPLETED" as JobStatus,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await client.getJobStatus("123");

      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/jobs/123`,
        expect.objectContaining({
          method: "GET",
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockApiKey}`,
          }),
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it("should throw error for empty jobId", async () => {
      await expect(client.getJobStatus("")).rejects.toThrow(
        "Job ID is required"
      );
    });
  });

  describe("cancelJob", () => {
    it("should successfully cancel a job", async () => {
      const mockResponse: JobResponse = {
        jobId: "123",
        status: "CANCELLED" as JobStatus,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await client.cancelJob("123");

      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/jobs/123`,
        expect.objectContaining({
          method: "DELETE",
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockApiKey}`,
          }),
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it("should throw error for empty jobId", async () => {
      await expect(client.cancelJob("")).rejects.toThrow("Job ID is required");
    });
  });

  describe("error handling", () => {
    it("should handle API errors", async () => {
      const errorResponse = {
        error: "BadRequest",
        data: { message: "Invalid request" },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve(errorResponse),
      });

      await expect(client.getJobStatus("123")).rejects.toThrow(
        "BadRequest: Invalid request"
      );
    });
  });
});
