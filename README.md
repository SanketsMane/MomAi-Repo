# MOM AI - Intelligent Knowledge Base Assistant

A powerful AI-powered chatbot application with advanced PDF knowledge base processing and real-time chat capabilities.

## 🚀 Features

- **AI-Powered Chat**: Intelligent responses using OpenAI GPT-4o-mini
- **PDF Knowledge Base**: Upload and extract content from PDF documents
- **Real-time Responses**: Get specific answers from your uploaded documents
- **Multi-App Architecture**: Web dashboard, embeddable widget, and standalone embed
- **Memory-Efficient Processing**: Optimized for large document handling
- **Authentication**: Secure Clerk-based authentication with organization support
- **Real-time Database**: Convex backend with live data synchronization

## 🏗️ Architecture

This is a modern monorepo built with:

- **Next.js 15** with Turbopack and React 19
- **Turborepo** for efficient monorepo management
- **Convex** for real-time backend and database
- **Clerk** for authentication and organization management
- **OpenAI** for AI text extraction and chat responses
- **Tailwind CSS** + **shadcn/ui** for modern UI components
- **TypeScript** for type safety across the entire stack

## 📁 Project Structure

```
├── apps/
│   ├── web/           # Main dashboard application
│   ├── widget/        # Embeddable chat widget
│   └── embed/         # Standalone embed application
├── packages/
│   ├── backend/       # Convex backend functions
│   ├── ui/           # Shared UI components
│   ├── math/         # Utility functions
│   └── config/       # Shared configurations
```

## 🔧 Getting Started

### Prerequisites

- Node.js 20+
- pnpm (recommended package manager)
- Convex account
- Clerk account
- OpenAI API key

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/SanketsMane/MOM-AI.git
cd MOM-AI
```

2. **Install dependencies**
```bash
pnpm install
```

3. **Set up environment variables**

Create `.env.local` files in the required apps with:

```bash
# Convex
CONVEX_DEPLOYMENT=your-convex-deployment
NEXT_PUBLIC_CONVEX_URL=your-convex-url

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your-clerk-key
CLERK_SECRET_KEY=your-clerk-secret

# OpenAI
OPENAI_API_KEY=your-openai-key
```

4. **Start the development servers**
```bash
pnpm run dev
```

This will start:
- Web app: http://localhost:3000
- Widget app: http://localhost:3001  
- Embed app: http://localhost:3002

## 💾 Backend Setup

1. **Initialize Convex**
```bash
cd packages/backend
npx convex dev
```

2. **Deploy functions**
The development server will automatically deploy your Convex functions.

## 📚 Usage

### Knowledge Base Management

1. **Upload PDFs**: Use the web dashboard to upload PDF documents
2. **AI Processing**: The system automatically extracts and processes content
3. **Smart Search**: Ask questions and get specific answers from your documents

### Chat Integration

1. **Web Dashboard**: Full-featured chat interface with knowledge base management
2. **Embeddable Widget**: Add the chat widget to any website
3. **Standalone Embed**: Direct embed for specific use cases

## 🔍 Key Features Deep Dive

### PDF Processing
- **Memory-Efficient Extraction**: Handles large PDFs without memory overflow
- **AI-Powered Content Extraction**: Uses GPT-4o-mini for intelligent content parsing
- **Real-time Processing**: Immediate availability after upload

### Knowledge Base
- **RAG System**: Advanced Retrieval-Augmented Generation for accurate responses
- **Vector Search**: Fast and accurate content retrieval
- **Organization-based**: Multi-tenant support with data isolation

### Debug Tools
- **Comprehensive Debugging**: Built-in tools for troubleshooting uploads and search
- **Real-time Monitoring**: Live feedback on processing status
- **Content Verification**: Tools to verify knowledge base content

## 🛠️ Development

### Adding UI Components

```bash
pnpm dlx shadcn@latest add button -c apps/web
```

### Monorepo Structure

Each app and package is independently configured but shares common dependencies and configurations.

### Backend Development

The Convex backend uses:
- **Actions**: For external API calls and complex operations
- **Mutations**: For database writes
- **Queries**: For real-time data fetching

## 🚀 Deployment

### Vercel Deployment

1. Connect your GitHub repository to Vercel
2. Set up environment variables
3. Deploy each app separately:
   - Web: `apps/web`
   - Widget: `apps/widget`
   - Embed: `apps/embed`

### Convex Deployment

```bash
cd packages/backend
npx convex deploy
```

## 🔧 Configuration

### Widget Integration

Add to any website:

```html
<script src="https://your-domain.com/widget.js" data-organization-id="your-org-id"></script>
```

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Sanket Mane**
- GitHub: [@SanketsMane](https://github.com/SanketsMane)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 🐛 Issues

Found a bug? Please create an issue on GitHub.

---

Built with ❤️ using modern web technologies
