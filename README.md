# HTTP Client Desktop App

A desktop HTTP client tool similar to Postman, built with Electron, Vue.js, and TypeScript.

## Features

- 🚀 **HTTP Methods**: Support for GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS
- 📝 **Request Builder**: Easy-to-use interface for building HTTP requests
- 🔧 **Headers & Parameters**: Manage request headers and query parameters
- 📄 **Request Body**: Support for JSON, form data, and raw text
- 🔒 **Authentication**: Basic Auth, Bearer Token, API Key support
- 📊 **Response Viewer**: View response body, headers, status, and timing
- 📚 **History**: Keep track of your request history
- 💾 **Collections**: Save and organize your requests
- 🌍 **Environments**: Manage environment variables
- 💾 **Import/Export**: Save and load request collections

## Tech Stack

- **Electron**: Desktop application framework
- **Vue.js 3**: Progressive JavaScript framework
- **TypeScript**: Type-safe development
- **Pinia**: State management
- **Vite**: Build tool and dev server
- **Axios**: HTTP client library

## Development

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/postman-clone.git
   cd postman-clone
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

   This will start both the Vite dev server and Electron app.

### Build

1. Build for production:
   ```bash
   npm run build
   ```

2. Create distributable packages:
   ```bash
   npm run dist
   ```

## Usage

1. **Making a Request**:
   - Enter your URL in the address bar
   - Select HTTP method (GET, POST, etc.)
   - Add headers, parameters, or request body as needed
   - Click "Send" to execute the request

2. **Managing Headers**:
   - Go to the "Headers" tab
   - Add key-value pairs for custom headers
   - Enable/disable headers using checkboxes

3. **Request Body**:
   - Switch to "Body" tab
   - Choose body type (JSON, Form Data, Raw Text)
   - Enter your request body content

4. **Authentication**:
   - Use the "Auth" tab to configure authentication
   - Supports Basic Auth, Bearer Token, and API Key

5. **Response Analysis**:
   - View response body in formatted JSON
   - Check response headers
   - Monitor response time and size
   - View HTTP status codes

## Keyboard Shortcuts

- `Ctrl/Cmd + N`: New Request
- `Ctrl/Cmd + S`: Save Request
- `Enter` (in URL bar): Send Request

## File Structure

```
src/
├── components/          # Vue components
├── views/              # Main views
├── stores/             # Pinia stores
├── services/           # API services
├── types/              # TypeScript types
├── router/             # Vue Router config
└── main.ts             # App entry point

electron/
├── main.ts             # Electron main process
└── preload.ts          # Preload script
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by Postman and Insomnia
- Built with modern web technologies for cross-platform desktop experience