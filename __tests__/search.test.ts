import { createMocks } from 'node-mocks-http'
import { POST } from '../app/api/search/route'
import { OpenAIStream } from 'ai'
import { mockStream } from '../utils/mockStream'

jest.mock('../utils/mockStream', () => ({
  mockStream: jest.fn(),
}))

jest.mock('ai', () => ({
  OpenAIStream: jest.fn(),
  StreamingTextResponse: jest.fn(),
}))

jest.mock('@pinecone-database/pinecone', () => ({
  PineconeClient: jest.fn().mockImplementation(() => ({
    init: jest.fn(),
    Index: jest.fn().mockReturnValue({
      query: jest.fn().mockResolvedValue({
        matches: [
          { metadata: { text: 'Sample context 1' } },
          { metadata: { text: 'Sample context 2' } },
        ],
      }),
    }),
  })),
}))

jest.mock('openai-edge', () => ({
  Configuration: jest.fn(),
  OpenAIApi: jest.fn().mockImplementation(() => ({
    createEmbedding: jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue({
        data: [{ embedding: [0.1, 0.2, 0.3] }],
      }),
    }),
    createChatCompletion: jest.fn().mockResolvedValue({
      // Mock response
    }),
  })),
}))

describe('Search API', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('should use mockStream in development environment', async () => {
    const originalEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'development'

    const { req, res } = createMocks({
      method: 'POST',
      body: {
        prompt: 'What is FCNB?',
      },
    })

    await POST(req)

    expect(mockStream).toHaveBeenCalled()

    process.env.NODE_ENV = originalEnv
  })

  it('should handle POST requests in production environment', async () => {
    const originalEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'production'

    const { req, res } = createMocks({
      method: 'POST',
      body: {
        prompt: 'What is FCNB?',
      },
    })

    await POST(req)

    expect(OpenAIStream).toHaveBeenCalled()

    process.env.NODE_ENV = originalEnv
  })
})

