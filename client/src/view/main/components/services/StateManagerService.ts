// StateManagerService.ts
export default class StateManagerService<T> {
  private state: T;
  private listeners: Function[] = [];

  constructor(initialState: T) {
    this.state = initialState;
  }

  getState(): T {
    return this.state;
  }

  setState(newState: T): void {
    this.state = newState;
    this.listeners.forEach((listener) => listener());
  }

  subscribe(listener: Function): () => void {
    this.listeners.push(listener);
    return () => this.unsubscribe(listener);
  }

  unsubscribe(listener: Function): void {
    this.listeners = this.listeners.filter((l) => l !== listener);
  }
}

// Create a global state manager for weather data
export const weatherDataManager = new StateManagerService<any[]>([]);
