type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogOptions {
  level?: LogLevel;
  context?: string;
  error?: Error;
  [key: string]: any;
}

class Logger {
  private static instance: Logger;
  private isDevelopment: boolean;

  private constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
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
