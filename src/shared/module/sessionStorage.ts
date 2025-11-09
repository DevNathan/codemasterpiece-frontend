class SessionStorage {
  constructor() {}

  static setItem<T>(key: string, value: T) {
    if (typeof window !== "undefined") {
      const serializedValue =
        typeof value === "string" ? value : JSON.stringify(value);
      sessionStorage.setItem(key, serializedValue);
    }
  }

  // `getItem`에서 JSON 데이터를 자동으로 파싱
  static getItem<T>(key: string): T | null {
    if (typeof window !== "undefined") {
      const storedValue = sessionStorage.getItem(key);
      if (storedValue === null) return null;

      try {
        return JSON.parse(storedValue) as T;
      } catch (_) {
        return storedValue as T;
      }
    }
    return null;
  }

  static removeItem(key: string) {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(key);
    }
  }
}

export default SessionStorage;
