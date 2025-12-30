import { Axiom } from '@axiomhq/js';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface QueryLogData {
  requestId: string;
  type: 'embedding' | 'pinecone_query' | 'chat_completion' | 'search_request' | 'search_response' | 'error';
  prompt?: string;
  language?: string;
  model?: string;
  durationMs?: number;
  tokenUsage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
  pineconeMatches?: number;
  response?: string;
  error?: string;
  errorStack?: string;
  metadata?: Record<string, unknown>;
}

interface LogOptions {
  level?: LogLevel;
  context?: string;
  error?: Error;
  [key: string]: unknown;
}

class Logger {
  private static instance: Logger;
  private axiom: Axiom | null = null;
  private dataset: string;
  private isDevelopment: boolean;

  private constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.dataset = process.env.AXIOM_DATASET || 'fcnb-gpt';

    // Initialize Axiom if token is available
    const axiomToken = process.env.AXIOM_TOKEN;
    if (axiomToken) {
      this.axiom = new Axiom({
        token: axiomToken,
      });
    } else if (!this.isDevelopment) {
      console.warn('AXIOM_TOKEN not set - logs will only be written to console');
    }
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private formatMessage(message: string, options?: LogOptions): string {
    const timestamp = new Date().toISOString();
    const context = options?.context ? `[${options.context}]` : '';
    return `${timestamp} ${context} ${message}`;
  }

  private async sendToAxiom(data: Record<string, unknown>): Promise<void> {
    if (this.axiom) {
      try {
        this.axiom.ingest(this.dataset, [{
          ...data,
          _time: new Date().toISOString(),
        }]);
        // Flush in background - don't await in edge runtime to avoid blocking
        this.axiom.flush().catch((err) => {
          console.error('Failed to flush Axiom logs:', err);
        });
      } catch (err) {
        console.error('Failed to send logs to Axiom:', err);
      }
    }
  }

  public generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  public async logQuery(data: QueryLogData): Promise<void> {
    const logEntry = {
      ...data,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
    };

    // Always log to console for visibility
    console.log(JSON.stringify(logEntry));

    // Send to Axiom
    await this.sendToAxiom(logEntry);
  }

  public async logSearchRequest(
    requestId: string,
    prompt: string,
    language: string
  ): Promise<void> {
    await this.logQuery({
      requestId,
      type: 'search_request',
      prompt,
      language,
    });
  }

  public async logEmbedding(
    requestId: string,
    prompt: string,
    model: string,
    durationMs: number,
    tokenUsage?: { totalTokens: number }
  ): Promise<void> {
    await this.logQuery({
      requestId,
      type: 'embedding',
      prompt,
      model,
      durationMs,
      tokenUsage: tokenUsage ? { totalTokens: tokenUsage.totalTokens } : undefined,
    });
  }

  public async logPineconeQuery(
    requestId: string,
    durationMs: number,
    matchCount: number,
    topK: number
  ): Promise<void> {
    await this.logQuery({
      requestId,
      type: 'pinecone_query',
      durationMs,
      pineconeMatches: matchCount,
      metadata: { topK },
    });
  }

  public async logChatCompletion(
    requestId: string,
    prompt: string,
    model: string,
    durationMs: number,
    response: string,
    tokenUsage?: { promptTokens?: number; completionTokens?: number; totalTokens?: number }
  ): Promise<void> {
    await this.logQuery({
      requestId,
      type: 'chat_completion',
      prompt,
      model,
      durationMs,
      response,
      tokenUsage,
    });
  }

  public async logSearchResponse(
    requestId: string,
    prompt: string,
    language: string,
    response: string,
    totalDurationMs: number
  ): Promise<void> {
    await this.logQuery({
      requestId,
      type: 'search_response',
      prompt,
      language,
      response,
      durationMs: totalDurationMs,
    });
  }

  public async logError(
    requestId: string,
    error: Error,
    context?: Record<string, unknown>
  ): Promise<void> {
    await this.logQuery({
      requestId,
      type: 'error',
      error: error.message,
      errorStack: error.stack,
      metadata: context,
    });
  }

  public debug(message: string, options?: Omit<LogOptions, 'level'>): void {
    if (this.isDevelopment) {
      console.debug(this.formatMessage(message, { ...options, level: 'debug' }));
    }
  }

  public info(message: string, options?: Omit<LogOptions, 'level'>): void {
    console.info(this.formatMessage(message, { ...options, level: 'info' }));
  }

  public warn(message: string, options?: Omit<LogOptions, 'level'>): void {
    console.warn(this.formatMessage(message, { ...options, level: 'warn' }));
  }

  public error(message: string, options?: Omit<LogOptions, 'level'>): void {
    const formattedMessage = this.formatMessage(message, { ...options, level: 'error' });
    if (options?.error) {
      console.error(formattedMessage, options.error);
    } else {
      console.error(formattedMessage);
    }
  }
}

export const logger = Logger.getInstance();
