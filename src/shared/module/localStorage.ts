const PREFIX = 'cm_';

export class LocalStorage {
  private static key(k: string) {
    return `${PREFIX}${k}`;
  }

  static setItem<T>(key: string, value: T) {
    if (typeof window === 'undefined') return;
    const data = typeof value === 'string' ? value : JSON.stringify(value);
    localStorage.setItem(this.key(key), data);
  }

  static getItem<T>(key: string): T | null {
    if (typeof window === 'undefined') return null;
    const value = localStorage.getItem(this.key(key));
    if (!value) return null;
    try {
      return JSON.parse(value);
    } catch {
      return value as unknown as T;
    }
  }

  static removeItem(key: string) {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.key(key));
  }

  static clear() {
    if (typeof window === 'undefined') return;
    Object.keys(localStorage).forEach((k) => {
      if (k.startsWith(PREFIX)) localStorage.removeItem(k);
    });
  }
}
