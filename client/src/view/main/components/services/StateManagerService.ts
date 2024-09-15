// StateManagerService.ts

export class StateManagerService<T extends any[]> {
  private fullState: T;
  private viewState: T;
  private currentSort: { column: string | null; asc: boolean } = {
    column: null,
    asc: true,
  };
  private listeners: Function[] = [];
  // Create a mapping from column header text to data keys
  private keyMap: { [key: string]: string } = {
    Date: "date",
    "Temperature (°C)": "temperatureC",
    "Temperature (°F)": "temperatureF",
    Summary: "summary",
  };

  constructor(initialState: T) {
    this.fullState = initialState;
    this.viewState = initialState; // Initially, viewState is the same as fullState
  }

  cleanup() {
    this.listeners = [];
    // Additional cleanup logic if needed
  }

  getState(): T {
    return this.viewState; // Always return the viewState for rendering
  }

  getFullState(): T {
    return this.fullState; // Method to access the fullState if needed
  }

  setState(newState: T): void {
    this.fullState = newState;
    this.viewState = newState; // Reset viewState to fullState when setting new state
    this.notifyListeners();
  }

  filterData(predicate: (item: T[0]) => boolean): void {
    this.viewState = this.fullState.filter(predicate) as T;
    this.notifyListeners();
  }

  resetFilters(): void {
    this.viewState = this.fullState; // Reset the viewState to the original fullState
    this.notifyListeners();
  }

  subscribe(listener: Function): () => void {
    this.listeners.push(listener);
    return () => this.unsubscribe(listener);
  }

  unsubscribe(listener: Function): void {
    this.listeners = this.listeners.filter((l) => l !== listener);
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener());
  }

  sortData(column: string, type: string, asc: boolean): void {
    this.currentSort = { column, asc };
    this.viewState = [...this.fullState].sort((a, b) => {
      const key = this.keyMap[column];
      let aValue = a[key],
        bValue = b[key];

      if (type === "number") {
        aValue = Number(aValue);
        bValue = Number(bValue);
      } else if (type === "date") {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      // Compare values for sorting
      if (aValue < bValue) return asc ? -1 : 1;
      if (aValue > bValue) return asc ? 1 : -1;

      return 0;
    }) as T; // Type assertion here

    this.notifyListeners();
  }

  resetFiltersAndSorting(): void {
    this.currentSort = { column: null, asc: true };
    this.viewState = this.fullState;
    this.notifyListeners();
  }
}

// Create a global state manager for weather data
export const weatherDataManager = new StateManagerService<any[]>([]);
