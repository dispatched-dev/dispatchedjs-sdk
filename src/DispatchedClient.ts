import type {
  DispatchedConfig,
  DispatchedError,
  DispatchJobRequestOptions,
  JobPayload,
  JobResponse,
  UpdateJobOptions,
} from "./types";

export class DispatchedClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor(config: DispatchedConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || "https://dispatched.dev/";
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

    endpoint = endpoint.replace(/^\//, "");
    const baseUrl = this.baseUrl.replace(/\/$/, "");
    const response = await fetch(`${baseUrl}/${endpoint}`, {
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
   * @param options - Job configuration
   * @returns Promise with job details
   */
  async dispatchJob(
    payload: JobPayload,
    options: DispatchJobRequestOptions = {}
  ): Promise<JobResponse> {
    if (!payload || typeof payload !== "object") {
      throw new Error("Invalid payload: must be a non-null object");
    }

    const body = {
      payload: payload,
      scheduledFor:
        options.scheduledFor instanceof Date
          ? options.scheduledFor.toISOString()
          : options.scheduledFor,
      maxRetries: options.maxRetries,
    };

    return this.request<JobResponse>("/api/jobs/dispatch", {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  /**
   * Get the job
   * @param jobId - The unique identifier of the job
   * @returns Promise with job details
   */
  async getJob(jobId: string): Promise<JobResponse> {
    if (!jobId) {
      throw new Error("Job ID is required");
    }

    return this.request<JobResponse>(`/api/jobs/${jobId}`, {
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

    return this.request<JobResponse>(`/api/jobs/${jobId}`, {
      method: "DELETE",
    });
  }

  /**
   * Update a queued job
   * @param jobId - The unique identifier of the job to update
   * @param options - Update options (currently supports scheduledFor)
   * @returns Promise with updated job details
   * @throws Error if job is not in QUEUED status
   */
  async updateJob(jobId: string, options: UpdateJobOptions): Promise<JobResponse> {
    if (!jobId) {
      throw new Error("Job ID is required");
    }

    if (!options || typeof options !== "object") {
      throw new Error("Update options are required");
    }

    if (!("scheduledFor" in options)) {
      throw new Error("scheduledFor is required in update options");
    }

    const body = {
      scheduledFor:
        options.scheduledFor instanceof Date
          ? options.scheduledFor.toISOString()
          : options.scheduledFor,
    };

    return this.request<JobResponse>(`/api/jobs/${jobId}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  }
}
