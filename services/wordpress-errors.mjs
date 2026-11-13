export class WordPressUnavailableError extends Error {
  constructor(message, { url, status, attempts, cause } = {}) {
    super(message, { cause });
    this.name = 'WordPressUnavailableError';
    this.url = url;
    this.status = status;
    this.attempts = attempts;
  }
}
