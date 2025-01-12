import type {
  DispatchedConfig,
  DispatchedError,
  DispatchJobRequestOptions,
  JobPayload,
  JobResponse,
} from "./types";

export class DispatchedClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor(config: DispatchedConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || "https://dispatched.dev/api";
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers = {
      Authorization: `Bearer ${this.apiKey}`,
      "Content-Type": "application/json",
      ...options.headers,
    };

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw this.handleError(data as DispatchedError);
    }

    return data as T;
  }

  private handleError(error: DispatchedError): Error {
    return new Error(`${error.error}: ${error.data.message}`);
  }

  /**
   * Queue a new job
   * @param payload - Payload
   * @param request - Job configuration
   * @returns Promise with job details
   */
  async dispatchJob(
    payload: JobPayload,
    request: DispatchJobRequestOptions = {}
  ): Promise<JobResponse> {
    if (!payload || typeof payload !== "object") {
      throw new Error("Invalid payload: must be a non-null object");
    }

    const body = {
      payload: payload,
      scheduleFor:
        request.scheduleFor instanceof Date
          ? request.scheduleFor.toISOString()
          : request.scheduleFor,
      maxRetries: request.maxRetries,
    };

    return this.request<JobResponse>("/jobs/dispatch", {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  /**
   * Get the status of a job
   * @param jobId - The unique identifier of the job
   * @returns Promise with job details
   */
  async getJobStatus(jobId: string): Promise<JobResponse> {
    if (!jobId) {
      throw new Error("Job ID is required");
    }

    return this.request<JobResponse>(`/jobs/${jobId}`, {
      method: "GET",
    });
  }

  /**
   * Cancel a queued job
   * @param jobId - The unique identifier of the job to cancel
   * @returns Promise with job details
   * @throws Error if job is not in QUEUED status
   */
  async cancelJob(jobId: string): Promise<JobResponse> {
    if (!jobId) {
      throw new Error("Job ID is required");
    }

    return this.request<JobResponse>(`/jobs/${jobId}`, {
      method: "DELETE",
    });
  }
}
