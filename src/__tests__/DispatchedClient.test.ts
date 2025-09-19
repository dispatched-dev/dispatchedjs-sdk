import { DispatchedClient } from "../DispatchedClient";
import { JobResponse, JobStatus, UpdateJobOptions } from "../types";

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
        `${mockBaseUrl}/api/jobs/dispatch`,
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

  describe("getJob", () => {
    it("should successfully get job status", async () => {
      const mockResponse: JobResponse = {
        jobId: "123",
        status: "COMPLETED" as JobStatus,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await client.getJob("123");

      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/api/jobs/123`,
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
      await expect(client.getJob("")).rejects.toThrow(
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
        `${mockBaseUrl}/api/jobs/123`,
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

  describe("updateJob", () => {
    it("should successfully update a job with a new scheduledFor date", async () => {
      const mockResponse: JobResponse = {
        jobId: "123",
        status: "QUEUED" as JobStatus,
        scheduledFor: "2024-01-01T10:00:00.000Z",
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const updateOptions: UpdateJobOptions = {
        scheduledFor: new Date("2024-01-01T10:00:00.000Z"),
      };

      const result = await client.updateJob("123", updateOptions);

      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/api/jobs/123`,
        expect.objectContaining({
          method: "PATCH",
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockApiKey}`,
            "Content-Type": "application/json",
          }),
          body: JSON.stringify({
            scheduledFor: "2024-01-01T10:00:00.000Z",
          }),
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it("should successfully update a job with a scheduledFor string", async () => {
      const mockResponse: JobResponse = {
        jobId: "123",
        status: "QUEUED" as JobStatus,
        scheduledFor: "2024-01-01T12:00:00.000Z",
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const updateOptions: UpdateJobOptions = {
        scheduledFor: "2024-01-01T12:00:00.000Z",
      };

      const result = await client.updateJob("123", updateOptions);

      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/api/jobs/123`,
        expect.objectContaining({
          method: "PATCH",
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockApiKey}`,
            "Content-Type": "application/json",
          }),
          body: JSON.stringify({
            scheduledFor: "2024-01-01T12:00:00.000Z",
          }),
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it("should successfully update a job with null scheduledFor to make it immediate", async () => {
      const mockResponse: JobResponse = {
        jobId: "123",
        status: "QUEUED" as JobStatus,
        scheduledFor: undefined,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const updateOptions: UpdateJobOptions = {
        scheduledFor: null,
      };

      const result = await client.updateJob("123", updateOptions);

      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/api/jobs/123`,
        expect.objectContaining({
          method: "PATCH",
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockApiKey}`,
            "Content-Type": "application/json",
          }),
          body: JSON.stringify({
            scheduledFor: null,
          }),
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it("should throw error for empty jobId", async () => {
      const updateOptions: UpdateJobOptions = {
        scheduledFor: new Date(),
      };

      await expect(client.updateJob("", updateOptions)).rejects.toThrow(
        "Job ID is required"
      );
    });

    it("should throw error for invalid update options", async () => {
      await expect(client.updateJob("123", null as any)).rejects.toThrow(
        "Update options are required"
      );

      await expect(client.updateJob("123", "invalid" as any)).rejects.toThrow(
        "Update options are required"
      );

      await expect(client.updateJob("123", {} as any)).rejects.toThrow(
        "scheduledFor is required in update options"
      );
    });

    it("should handle API errors when updating a job", async () => {
      const errorResponse = {
        error: "BadRequest",
        data: { message: "Job is not in QUEUED status" },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve(errorResponse),
      });

      const updateOptions: UpdateJobOptions = {
        scheduledFor: new Date(),
      };

      await expect(client.updateJob("123", updateOptions)).rejects.toThrow(
        "BadRequest: Job is not in QUEUED status"
      );
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

      await expect(client.getJob("123")).rejects.toThrow(
        "BadRequest: Invalid request"
      );
    });
  });
});
