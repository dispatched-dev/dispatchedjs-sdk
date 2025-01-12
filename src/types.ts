export type JobStatus =
  | "QUEUED"
  | "DISPATCHED"
  | "STARTED"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED";

export interface JobPayload {
  [key: string]: any;
}

export interface DispatchJobRequestOptions {
  scheduleFor?: string | Date;
  maxRetries?: number;
}

export interface JobResponse {
  jobId: string;
  status: JobStatus;
  scheduledFor?: string;
}

export interface DispatchedConfig {
  apiKey: string;
  baseUrl?: string;
  debug?: boolean;
}

export interface DispatchedError {
  error: string;
  data: {
    message: string;
  };
}

export interface WebhookPayload<T = any> {
  jobId: string;
  attempt: string;
  attemptNumber: number;
  payload: T;
}

export interface WebhookClientConfig {
  webhookSecret: string;
  debug?: boolean;
}
