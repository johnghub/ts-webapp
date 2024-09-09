// StateManagerService.ts
export default class StateManagerService<T extends any[]> {
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

  filterData(predicate: (item: T[0]) => boolean): void {
    const filteredState = this.state.filter(predicate) as T;
    this.setState(filteredState);
  }

  updateData(updateFunc: (item: T[0], index: number) => T[0]): void {
    const updatedState = this.state.map(updateFunc) as T;
    this.setState(updatedState);
  }
}

// Create a global state manager for weather data
export const weatherDataManager = new StateManagerService<any[]>([]);
