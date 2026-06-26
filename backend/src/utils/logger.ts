// src/utils/logger.ts
interface Logger {
  http: (msg: string, ...args: any[]) => void;
  debug: (msg: string, ...args: any[]) => void;
  info: (msg: string, ...args: any[]) => void;
  warn: (msg: string, ...args: any[]) => void;
  error: (msg: string, ...args: any[]) => void;
}

const logger: Logger = {
  http: (msg, ...args) => console.log('HTTP:', msg, ...args),
  debug: (msg, ...args) => console.debug('DEBUG:', msg, ...args),
  info: (msg, ...args) => console.log('INFO:', msg, ...args),
  warn: (msg, ...args) => console.warn('WARN:', msg, ...args),
  error: (msg, ...args) => console.error('ERROR:', msg, ...args),
};

export default logger;





