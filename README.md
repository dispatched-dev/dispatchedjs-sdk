# DispatchedJs/sdk

A browser-compatible TypeScript library providing DataManager and ApiClient classes.

## Installation

```bash
npm install your-library-name
```

## Usage

```typescript
import { DataManager, ApiClient } from "your-library-name";

// Using DataManager
const dataManager = new DataManager();
dataManager.set("key", "value");
console.log(dataManager.get("key")); // 'value'

// Using ApiClient
const apiClient = new ApiClient("https://api.example.com");
const data = await apiClient.get("/endpoint");
```

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
