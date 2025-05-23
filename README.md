# FCNB GPT - AI-Powered Regulatory Search Assistant

An intelligent search assistant built for the Financial Commission of New Brunswick (FCNB) that leverages advanced AI technologies to provide accurate, context-aware responses about financial regulations and compliance information.

## 🎥 Demo
https://github.com/user-attachments/assets/59539602-c71e-460b-9017-84974040a1c4

https://github.com/user-attachments/assets/eacc45d4-ceca-40f0-b864-e1cb6f907eeb

## 🚀 Features

- **Intelligent Search**: AI-powered search using OpenAI's GPT models with RAG (Retrieval-Augmented Generation)
- **Vector Database**: Powered by Pinecone for semantic document retrieval
- **Multilingual Support**: Dynamic language switching between English and French
- **Real-time Streaming**: Live-streamed AI responses for better user experience
- **Modern UI/UX**: Beautiful, responsive interface with dark/light mode toggle
- **Edge Runtime**: Optimized for fast performance using Next.js Edge Runtime

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **AI/ML**: OpenAI GPT-4, Text Embeddings (text-embedding-3-small)
- **Vector Database**: Pinecone
- **Search**: Semantic search with vector similarity
- **Icons**: Lucide React
- **Architecture**: Edge Runtime, Server-Side Rendering

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────┐    ┌─────────────────┐
│   User Query    │───▶│   Embedding  │───▶│   Pinecone DB   │
└─────────────────┘    └──────────────┘    └─────────────────┘
                                                    │
                                                    ▼
┌─────────────────┐    ┌──────────────┐    ┌─────────────────┐
│  GPT Response   │◀───│  OpenAI GPT  │◀───│  Context Data   │
└─────────────────┘    └──────────────┘    └─────────────────┘
```

## 📋 Key Technical Achievements

- **RAG Implementation**: Built a sophisticated Retrieval-Augmented Generation system that combines vector search with large language models
- **Semantic Search**: Implemented text embedding and vector similarity search for accurate document retrieval
- **Streaming Responses**: Real-time AI response streaming for enhanced user experience
- **Multilingual Processing**: Dynamic language detection and response generation in multiple languages
- **Performance Optimization**: Edge runtime deployment for minimal latency
- **Scalable Architecture**: Microservices-ready API structure with proper error handling

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- OpenAI API key
- Pinecone API key and index

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/fcnb-gpt.git
   cd fcnb-gpt
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Add your API keys to `.env`:
   ```env
   OPENAI_API_KEY=your_openai_api_key
   OPENAI_MODEL=gpt-4
   PINECONE_API_KEY=your_pinecone_api_key
   PINECONE_INDEX_NAME=your_index_name
   PINECONE_HOST=your_pinecone_host
   ```

4. **Development Server**
   ```bash
   npm run dev
   ```

5. **Open [http://localhost:3000](http://localhost:3000)**

## 🎯 Project Goals

This project demonstrates:
- Advanced AI/ML integration in web applications
- Vector database implementation for semantic search
- Modern React/Next.js best practices
- Responsive, accessible UI design
- Multilingual application architecture
- Performance optimization techniques

## 📊 Performance Features

- **Edge Runtime**: Deployed on Vercel Edge Functions for global performance
- **Streaming**: Real-time response streaming reduces perceived latency
- **Vector Search**: Sub-second semantic document retrieval
- **Optimized Embeddings**: Efficient text embedding generation and caching

## 🌟 Highlights

- **Production-Ready**: Built with enterprise-grade patterns and error handling
- **Scalable**: Designed to handle high-volume queries with vector database optimization
- **User-Centric**: Intuitive interface with accessibility considerations
- **Maintainable**: Clean, typed codebase with component-based architecture

## 📝 License

This project is built for demonstration purposes and showcases modern AI application development practices.

---

**Built with ❤️ using Next.js, OpenAI, and Pinecone**
