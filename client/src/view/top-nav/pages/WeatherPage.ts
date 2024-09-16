import { IConnectedCallback, IRenderable, IWeatherData } from "../../main";
import { weatherDataManager } from "../../main/components";
import { WeatherPageFilterDialog } from "../dialogs/WeatherPageFilterDialog";
import { WEATHER_EDIT_MODAL_TAG } from "../../../common";
import { WeatherPageEditDialog } from "../dialogs/WeatherPageEditDialog";

type PredicateFunction = (item: IWeatherData, value: string) => boolean;

export default class WeatherTable
  extends HTMLElement
  implements IRenderable, IConnectedCallback
{
  private currentSort = { column: "", asc: true };
  private table: HTMLTableElement;
  private div: HTMLDivElement;
  private headers: NodeListOf<HTMLElement>;

  constructor() {
    super();
    this.initTable();
  }

  predicates: Record<string, PredicateFunction> = {
    date: (item, value) => {
      // Function to normalize date to YYYY-MM-DD
      const normalizeDate = (dateString: string): string => {
        const date = new Date(dateString);
        if (!isNaN(date.getTime())) {
          // Successfully created a valid date object
          return date.toISOString().slice(0, 10); // Extract YYYY-MM-DD part
        } else {
          // Handle invalid date string
          console.error("Invalid date format:", dateString);
          return ""; // Return an empty string on failure
        }
      };

      // Normalize both the item's date and the input value
      const normalizedItemDate = normalizeDate(item.date);
      const normalizedInputDate = normalizeDate(value);

      // Compare normalized dates
      return normalizedItemDate === normalizedInputDate;
    },
    temperatureC: (item, value) => item.temperatureC === Number(value),
    temperatureF: (item, value) => item.temperatureF === Number(value),
    summary: (item, value) => item.summary === value,
  };

  connectedCallback(): void {
    this.fetchAndDisplayWeather();
    weatherDataManager.subscribe(() => this.render());

    this.div
      .querySelector("#filterBtn")!
      .addEventListener("click", () => this.showWeatherPageFilterDialog());

    this.div
      .querySelector("#resetBtn")!
      .addEventListener("click", () => this.resetData());

    this.div
      .querySelector("#addBtn")!
      .addEventListener("click", () => this.showWeatherPageEditDialog(true));

    document.addEventListener("apply-filter", (event) =>
      this.handleFilter(event)
    );
  }

  disconnectedCallback(): void {
    weatherDataManager.unsubscribe(() => this.render());

    this.querySelector("#filterBtn")!.removeEventListener("click", () =>
      this.showWeatherPageFilterDialog()
    );
    this.querySelector("#resetBtn")!.removeEventListener("click", () =>
      this.resetData()
    );
    this.querySelector("#addBtn")!.removeEventListener("click", () =>
      this.showWeatherPageEditDialog(true)
    );
    document.removeEventListener("apply-filter", (event) =>
      this.handleFilter(event)
    );

    weatherDataManager.cleanup();
  }

  showWeatherPageEditDialog(addData: boolean) {
    const weatherPageEditDialog = document.querySelector(
      WEATHER_EDIT_MODAL_TAG
    ) as WeatherPageEditDialog;
    if (weatherPageEditDialog) {
      weatherPageEditDialog.show(addData);
    } else {
      console.error("Edit modal not found!");
    }
  }

  showWeatherPageFilterDialog() {
    const WeatherPageFilterDialog = document.querySelector(
      "filter-modal"
    ) as WeatherPageFilterDialog;
    if (WeatherPageFilterDialog) {
      WeatherPageFilterDialog.show();
    } else {
      console.error("Filter modal not found!");
    }
  }

  handleFilter(event: any) {
    // Implement your filtering logic here
    const { filterType, filterInput } = event.detail;
    console.log(`Filtering by ${filterType} for value ${filterInput}`);
    //    weatherDataManager.filterData((item) => item.summary === filterInput);

    // Select the appropriate predicate based on filterType
    const predicate = this.predicates[filterType];
    if (predicate) {
      // TODO: Not working for numeric values, probably because they are strings
      weatherDataManager.filterData((item: IWeatherData) =>
        predicate(item, filterInput)
      );
      console.log(`Filtering by ${filterType} for value ${filterInput}`);
    } else {
      console.error(`No predicate found for filter type: ${filterType}`);
    }
  }

  resetData() {
    weatherDataManager.resetFiltersAndSorting();
    this.clearSortIndicators(this.headers);
  }

  async fetchAndDisplayWeather(): Promise<void> {
    try {
      const response = await fetch(
        "https://localhost:7129/api/weatherforecast"
      ); // Adjust the endpoint as necessary
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const weatherData = await response.json();
      weatherDataManager.setState(weatherData); // Update global state
    } catch (error) {
      console.error("Failed to fetch weather data:", error);
    }
  }

  initTable(): void {
    this.div = document.createElement("div");
    this.div.style.display = "flex";
    this.div.style.flexDirection = "column"; // Stacks children vertically

    const buttonContainer = document.createElement("div");
    buttonContainer.style.display = "flex"; // Aligns children (buttons) horizontally
    buttonContainer.style.justifyContent = "flex-start"; // Aligns buttons to the left
    buttonContainer.style.marginBottom = "10px"; // Adds space between buttons and table

    // Enhanced styling for the button container
    buttonContainer.style.borderBottom = "1px solid #ccc";
    buttonContainer.style.paddingBottom = "10px";

    // Filter button with funnel icon
    const filterBtn = document.createElement("button");
    filterBtn.id = "filterBtn";
    filterBtn.innerHTML = '<i class="fas fa-filter"></i>'; // Using Font Awesome filter icon
    filterBtn.style.cursor = "pointer";
    filterBtn.title = "Filter"; // Tooltip to indicate the action
    filterBtn.style.flex = "0 0 auto"; // Don't grow or shrink
    filterBtn.style.padding = "10px 15px"; // Adequate padding for button size

    // Reset button with recycle icon
    const resetBtn = document.createElement("button");
    resetBtn.id = "resetBtn";
    resetBtn.innerHTML = '<i class="fas fa-sync-alt"></i>'; // Using Font Awesome recycle icon
    resetBtn.style.cursor = "pointer";
    resetBtn.title = "Reset"; // Tooltip to indicate the action
    resetBtn.style.flex = "0 0 auto"; // Don't grow or shrink
    resetBtn.style.padding = "10px 15px"; // Adequate padding for button size

    const addButton = document.createElement("button");
    addButton.id = "addBtn";
    addButton.innerHTML = '<i class="fas fa-plus"></i>'; // Using Font Awesome plus icon
    addButton.style.cursor = "pointer";
    addButton.title = "Add new entry";
    addButton.style.flex = "0 0 auto";
    addButton.style.padding = "10px 15px";

    // Append buttons to the button container
    buttonContainer.appendChild(filterBtn);
    buttonContainer.appendChild(resetBtn);
    buttonContainer.appendChild(addButton);

    // Append the button container to the div
    this.div.appendChild(buttonContainer);

    // Create and setup the table
    this.table = document.createElement("table");
    this.table.innerHTML = `
          <style>
              table {
                  width: 100%;
                  border-collapse: collapse;
              }
              th, td {
                  border: 1px solid #ddd;
                  padding: 8px;
                  text-align: left;
              }
              th {
                  background-color: #4a90e2;
                  color: white;
                  font-size: 16px;
                  font-weight: bold;
                  cursor: pointer;
              }
              .asc::after {
                  content: " \\25B2"; /* Unicode for up triangle */
              }
              .desc::after {
                  content: " \\25BC"; /* Unicode for down triangle */
              }
              button {
                  margin: 10px;
                  padding: 5px 10px;
                  font-size: 14px;
              }
              .weather-table tbody tr {
                transition: transform 0.3s ease, background-color 0.3s ease;
              }
              .weather-table.sorting tbody tr {
                transform: translateY(20px);
                opacity: 0.5; /* Slightly fade the rows when sorting */
              }
              .weather-table.resetting tbody tr {
                opacity: 0.2; /* Dim the rows when resetting */
                transition: opacity 0.5s ease;
              }
          </style>
          <!-- button id="filterBtn">Filter Data</button -->
          <thead>
              <tr>
                  <th data-type="date">Date</th>
                  <th data-type="number">Temperature (°C)</th>
                  <th data-type="number">Temperature (°F)</th>
                  <th data-type="text">Summary</th>
              </tr>
          </thead>
          <tbody>
          </tbody>
      `;

    // Append the table to the div
    this.div.appendChild(this.table);

    // Assuming `this` is an HTMLElement, append the div to it
    this.appendChild(this.div);

    this.headers = this.table.querySelectorAll("th");
    this.headers.forEach((header) => {
      header.addEventListener("click", () => {
        const type = header.getAttribute("data-type") as string;
        const column = header.textContent || "";
        const isAsc =
          this.currentSort.column === column && this.currentSort.asc;
        this.currentSort = { column, asc: !isAsc };

        // TODO: Figure out why this has no effect:
        this.table.classList.add("sorting"); // Add sorting class to trigger animations
        weatherDataManager.sortData(column, type, !isAsc);

        this.updateSortIndicator(this.headers, header, !isAsc);

        // TODO: Figure out why this has no effect:
        requestAnimationFrame(() => {
          this.table.classList.remove("sorting"); // Remove sorting class after reflow
        });
      });
    });
  }

  render(): HTMLElement {
    const weatherData = weatherDataManager.getState(); // Get current state

    const tbody = this.table.querySelector("tbody");
    if (tbody) {
      this.populateRows(weatherData, tbody);
    } else {
      console.error("Failed to find tbody element");
    }

    this.innerHTML = ""; // Clear existing contents
    this.appendChild(this.div); // Append the new table
    return this.table;
  }

  populateRows(data: any[], tbody: HTMLTableSectionElement): void {
    tbody.innerHTML = ""; // Clear existing rows
    data.forEach((entry) => {
      const row = tbody.insertRow();
      row.innerHTML = `
        <td>${entry.date}</td>
        <td>${entry.temperatureC}</td>
        <td>${entry.temperatureF}</td>
        <td>${entry.summary}</td>
      `;
    });
  }

  clearSortIndicators(headers: NodeListOf<HTMLElement>) {
    headers.forEach((header) => {
      header.classList.remove("asc", "desc");
    });
  }

  updateSortIndicator(
    headers: NodeListOf<HTMLElement>,
    activeHeader: HTMLElement,
    asc: boolean
  ): void {
    this.clearSortIndicators(headers); // Clear all first
    if (activeHeader) {
      // Ensure there is an active header to update
      activeHeader.classList.add(asc ? "asc" : "desc");
    }
  }

  searchColumn(columnKey: string, query: string | [number, number]): void {
    const predicate = (item: any) => {
      if (Array.isArray(query)) {
        // Handle range query for numbers
        return item[columnKey] >= query[0] && item[columnKey] <= query[1];
      }
      return item[columnKey] === query; // Handle specific value query
    };
    weatherDataManager.filterData(predicate);
  }

  editData(index: number, newData: object): void {
    weatherDataManager.updateData((item, idx) => {
      if (idx === index) {
        return { ...item, ...newData };
      }
      return item;
    });
  }
}

const WEATHER_TABLE_TAG = "weather-table";
if (!customElements.get(WEATHER_TABLE_TAG)) {
  customElements.define(WEATHER_TABLE_TAG, WeatherTable);
}
