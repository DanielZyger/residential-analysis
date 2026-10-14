export interface Logger {
  info(message: string): void;
  warn(message: string): void;
  error(message: string): void;
  child(prefix: string): Logger;
}

export function createLogger(prefix = ''): Logger {
  const tag = prefix ? `[${prefix}] ` : '';
  return {
    info: (m) => console.log(`${tag}${m}`),
    warn: (m) => console.warn(`${tag}⚠ ${m}`),
    error: (m) => console.error(`${tag}✖ ${m}`),
    child: (p) => createLogger(prefix ? `${prefix}:${p}` : p),
  };
}
