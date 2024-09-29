interface IIdentifiable {
  Id: number;
  [key: string]: string | number | Date; // Assuming all properties are either string or number
}

export class StateManagerService<T extends IIdentifiable[]> {
  private fullState: T;
  private viewState: T;
  private currentSort: { column: string | null; asc: boolean } = {
    column: null,
    asc: true,
  };

  private listeners: Function[] = [];

  // Create a mapping from column header text to data keys
  private keyMap: { [key: string]: keyof IIdentifiable } = {
    Date: "date",
    "Temperature (°C)": "temperatureC",
    "Temperature (°F)": "temperatureF",
    Summary: "summary",
  };

  private currentId: number | null = null; // Store the current ID being edited or viewed

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

  addData(newItem: T[0]): void {
    this.fullState = [newItem, ...this.fullState] as T; // Prepend new item to fullState
    this.viewState = [newItem, ...this.viewState] as T; // Prepend new item to viewState

    if (this.currentSort.column) {
      // Reapply sorting if there's an active sort
      this.sortData(
        this.currentSort.column,
        this.getType(this.currentSort.column),
        this.currentSort.asc
      );
    } else {
      // Otherwise, just notify listeners about the update
      this.notifyListeners();
    }
  }

  getType(column: string): string {
    // Helper function to determine the type based on column name
    switch (column) {
      case "Temperature (°C)":
      case "Temperature (°F)":
        return "number";
      case "Date":
        return "date";
      default:
        return "text";
    }
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

  // Method to get the current ID
  getCurrentId(): number | null {
    return this.currentId;
  }

  // Method to set the current ID
  setCurrentId(id: number | null): void {
    this.currentId = id;
  }

  getDataById(id: number): T[0] | undefined {
    // Find and return the item with the matching Id
    return this.fullState.find((item) => item.id === id);
  }

  updateData(updatedItem: IIdentifiable): void {
    const index = this.fullState.findIndex(
      (item) => item.id === updatedItem.id
    );
    if (index !== -1) {
      this.fullState[index] = updatedItem;
      this.viewState[index] = updatedItem; // Depending on your view logic
      this.notifyListeners();
    }
  }

  removeData(id: number) {
    // Assuming 'Id' is the property that holds the unique identifier
    this.fullState = this.fullState.filter((item) => item.id !== id) as T;
    this.viewState = this.viewState.filter((item) => item.id !== id) as T;
    this.notifyListeners();
  }
}

// Create a global state manager for weather data
export const weatherDataManager = new StateManagerService<any[]>([]);
