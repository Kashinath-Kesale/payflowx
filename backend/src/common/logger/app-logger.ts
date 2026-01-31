/* eslint-disable prettier/prettier */
type LogLevel = 'info' | 'warn' | 'error';

interface LogContext {
  service: string;
  action: string;
  entityId?: string;
  metadata?: Record<string, any>;
}

export class AppLogger {
  private static log(level: LogLevel, message: string, context: LogContext) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...context,
    };

    console.log(JSON.stringify(logEntry));
  }

  static info(message: string, context: LogContext) {
    this.log('info', message, context);
  }

  static warn(message: string, context: LogContext) {
    this.log('warn', message, context);
  }

  static error(message: string, context: LogContext) {
    this.log('error', message, context);
  }
}
