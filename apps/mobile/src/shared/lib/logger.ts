type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class Logger {
  private static instance: Logger;
  private isDebugEnabled: boolean = __DEV__;

  private constructor() {}

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  public setDebugEnabled(enabled: boolean) {
    this.isDebugEnabled = enabled;
  }

  private formatMessage(level: LogLevel, component: string, message: string): string {
    const timestamp = new Date().toISOString().split('T')[1].split('Z')[0];
    return `[${timestamp}] [${level.toUpperCase()}] [${component}] ${message}`;
  }

  public debug(component: string, message: string, data?: unknown) {
    if (this.isDebugEnabled) {
      // eslint-disable-next-line no-console
      console.log(this.formatMessage('debug', component, message), data ?? '');
    }
  }

  public info(component: string, message: string, data?: unknown) {
    // eslint-disable-next-line no-console
    console.log(this.formatMessage('info', component, message), data ?? '');
  }

  public warn(component: string, message: string, data?: unknown) {
    console.warn(this.formatMessage('warn', component, message), data ?? '');
  }

  public error(component: string, message: string, error?: unknown) {
    console.error(this.formatMessage('error', component, message), error ?? '');
  }
}

export const logger = Logger.getInstance();
