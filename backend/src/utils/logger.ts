function ts(): string {
  return new Date().toTimeString().slice(0, 8);
}

export const logger = {
  log: (message: string, ...args: unknown[]) =>
    console.log(`[${ts()}] ${message}`, ...args),
  debug: (message: string, ...args: unknown[]) =>
    console.debug(`[${ts()}] ${message}`, ...args),
  warn: (message: string, ...args: unknown[]) =>
    console.warn(`[${ts()}] ${message}`, ...args),
  error: (message: string, ...args: unknown[]) =>
    console.error(`[${ts()}] ${message}`, ...args),
};
