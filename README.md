# DispatchedJS - SDK

This is a TypeScript helper library for node.js server side to integrate [https://dispatched.dev](https://dispatched.dev) into your application.
Perfect fot Next.js, Express, Koa, Hapi, Fastify, etc.

## Installation

```bash
npm install @dispatchedjs/sdk
```

## Usage

### Dispatching a job

```typescript
import { DispatchedClient } from "@dispatchedjs/sdk";

const client = new DispatchedClient({
    apiKey: process.env.DISPATCHED_API_KEY
});

// dispatch a job immediately
const myPayload1 = { action: "example-action", data: "example-data" }; // must be serializable
const job1 = await client.dispatchJob(myPayload1, {
    maxRetries: 3,
});
console.log(job1); // { jobId: 'job_1234567890abcdef', status: 'QUEUED' }

// schedule for later
const myPayload2 = { action: "example-action", data: "example-data" }; // must be serializable
const job2 = await client.dispatchJob(myPayload1, {
    sheduleFor: new Date("2024-12-17T12:00:00Z"),
});
console.log(job2); // { jobId: 'job_1234567890abcdef', status: 'QUEUED' }

```

### Checking job status

```typescript

const client = new DispatchedClient({
    apiKey: process.env.DISPATCHED_API_KEY
});

const jobId = "job_1234567890abcdef"; // from a job that was previously dispatched

const job = await client.getJob(jobId);
console.log(job); // { jobId: 'job_1234567890abcdef', status: 'QUEUED' }

```

### Cancelling a job

```typescript

// NOTE: Only jobs that are in the QUEUED state can be cancelled.

const client = new DispatchedClient({
    apiKey: process.env.DISPATCHED_API_KEY
});

const jobId = "job_1234567890abcdef"; // from a job that was previously dispatched

const job = await client.cancelJob(jobId);
console.log(job); // { jobId: 'job_1234567890abcdef', status: 'CANCELLED' }

```

### Handle Webhook Verification

```typescript

const webhookClient = new DispatchedWebhookClient({
    webhookSecret: process.env.DISPATCHED_WEBHOOK_SECRET
});

try {
    const payload = await webhookClient.getVerifiedPayload(req.headers.get('Authorization'), req.body);
    // TODO: do something with your payload
} catch (error) {
    console.error(error);
}

```

## Debugging

Pass the `debug` option as `true` to the clients.

```typescript

// client
const client = new DispatchedClient({
    apiKey: process.env.DISPATCHED_API_KEY,
    debug: true
});

// webhook client
const webhookClient = new DispatchedWebhookClient({
    webhookSecret: process.env.DISPATCHED_WEBHOOK_SECRET,
    debug: true
});

```

## Local Development

When developing locally, you can use the  [Dispatched CLI](https://github.com/dispatched-dev/dispatchedjs-cli) to start a local server that will receive webhook callbacks.


1. Install the CLI globally:
```bash
npm install -g @dispatchedjs/cli
```

2. Start the local server (this would run the local sever at `http://localhost:3100`):
```bash
dispatchedjs listen --secret="any-webhook-secret-for-local-dev" --forward="http://localhost:3000/path/to/webhook/endpoint" --port=3100 
```
Options:
- `--secret` is the secret you want to use to verify the webhook requests. For security reasons, it is recommended to use a different secret than the one you use in production (you can use something simple like "abc123" for local development).
- `--forward` is the URL that Dispatched will send the webhook requests to.
- `--port` (optional) is the port you want the server to listen on. It defaults to `3100`.

NOTE: Scheduled jobs will be processed immediately when using the local server.

3. Override the `baseUrl` to point to the local server in your code:

```bash
# .env
DISPATCHED_API_BASE_URL=http://localhost:3100
```

```typescript
const client = new DispatchedClient({
    apiKey: process.env.DISPATCHED_API_KEY,
    baseUrl: process.env.DISPATCHED_API_BASE_URL
});
```

NOTE: You can pass an empty string to `DISPATCHED_API_BASE_URL` to use the default (production) Dispatched API URL.
Simply leave the `baseUrl: process.env.DISPATCHED_API_BASE_URL` in the source code and not set the `env` variable in production.

## License

MIT
