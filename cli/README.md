// README.md

# Your Library Name

A browser-compatible TypeScript library providing DataManager and ApiClient classes.

## Installation

```bash
npm install @dispatchedjs/sdk
```

## Usage

### As a Library

```typescript
import { DataManager, ApiClient, Server } from "@dispatchedjs/sdk";

// Using DataManager
const dataManager = new DataManager();
dataManager.set("key", "value");
console.log(dataManager.get("key")); // 'value'

// Using ApiClient
const apiClient = new ApiClient("https://api.example.com");
const data = await apiClient.get("/endpoint");

// Using Server
const server = new Server("http://api.example.com");
server.listen(3000);
```

### CLI Usage

After installing globally (`npm install -g @dispatchedjs/sdk`), you can use the CLI:

```bash
# Start server on default port 3000
dispatchedjs serve

# Start server on custom port
dispatchedjs serve --port 8080

# Start server with custom base URL
dispatchedjs serve --baseUrl https://api.example.com

# Show help
dispatchedjs --help
```

The server provides the following endpoints:

- `GET /data/:key` - Get stored value
- `POST /data/:key` - Store value (send JSON with "value" property)
- `GET /proxy/*` - Proxy requests to the configured base URL

## Classes

### DataManager

A simple key-value store manager.

Methods:

- `set(key: string, value: any)`: Store a value
- `get(key: string)`: Retrieve a value
- `clear()`: Clear all stored data
- `getAll()`: Get all stored data

### ApiClient

A simple HTTP client for making API requests.

Methods:

- `get<T>(endpoint: string): Promise<T>`: Make GET request
- `post<T>(endpoint: string, data: any): Promise<T>`: Make POST request
- `setHeader(key: string, value: string)`: Set custom header

## Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Build the library: `npm run build`
4. Run tests: `npm test`

## License

MIT
