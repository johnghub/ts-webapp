import { IConnectedCallback, IRenderable, IWeatherData } from "../../main";
import { weatherDataManager } from "../../main/components";
import { WeatherPageFilterDialog } from "../dialogs/WeatherPageFilterDialog";
import { WEATHER_EDIT_MODAL_TAG } from "../../../common";
import { WeatherPageEditDialog } from "../dialogs/WeatherPageEditDialog";
import { GetWeatherForecast } from "../../../codegen/api";
//import {GetWeatherForecast} from "../../../"

type PredicateFunction = (item: IWeatherData, value: string) => boolean;

export default class WeatherTable
  extends HTMLElement
  implements IRenderable, IConnectedCallback
{
  private currentSort = { column: "", asc: true };
  private table: HTMLTableElement | undefined;
  private div: HTMLDivElement | undefined;
  private headers!: NodeListOf<HTMLElement>;

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

    this.div!.querySelector("#filterBtn")!.addEventListener("click", () =>
      this.showWeatherPageFilterDialog()
    );

    this.div!.querySelector("#resetBtn")!.addEventListener("click", () =>
      this.resetData()
    );

    this.div!.querySelector("#addBtn")!.addEventListener("click", () =>
      this.showWeatherPageEditDialog(true)
    );

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

  showWeatherPageEditDialog(addData: boolean, id?: number) {
    const weatherPageEditDialog = document.querySelector(
      WEATHER_EDIT_MODAL_TAG
    ) as WeatherPageEditDialog;
    if (weatherPageEditDialog) {
      weatherPageEditDialog.show(addData, id);
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

    // Select the appropriate predicate based on filterType
    const predicate = this.predicates[filterType];
    if (predicate) {
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
    const result = await GetWeatherForecast();

    if (result.error) {
      console.error("Error fetching weather forecast:", result.error);
    } else if (result.data) {
      weatherDataManager.setState(result.data); // Update global state(result.data);
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

    // Add class name for targeting by CSS
    buttonContainer.className = "button-container";

    // Append the button container to the div
    this.div.appendChild(buttonContainer);

    // Create and setup the table
    this.table = document.createElement("table");
    // Add the 'weather-table' class to the table
    this.table.classList.add("weather-table");
    this.table.innerHTML = `
          <style>
              table {
                  width: 100%;
                  border-collapse: collapse;
              }
              .button-container button:not(:last-child) {
                  margin-right: 10px;  // Adds spacing between buttons, but not after the last button
              }
              .asc::after {
                  content: " \\25B2"; /* Unicode for up triangle */
              }
              .desc::after {
                  content: " \\25BC"; /* Unicode for down triangle */
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
              .weather-table th {
                  background-color: #4a90e2; /* Header background color */
                  color: white; /* Text color for headers */
                  font-size: 16px; /* Size of the font in headers */
                  font-weight: bold; /* Make header text bold */
                  text-align: center; /* Horizontally center header text */
                  vertical-align: middle; /* Vertically center header text */
                  padding: 8px; /* Padding around text */
                  border: 1px solid #ddd; /* Border around each header cell */
              }
              .weather-table td {
                  text-align: center; /* Center-aligns all cell content, adjust if necessary */
                  vertical-align: middle; /* Vertically center content in the cells */
                  border: 1px solid #ddd;
              }
              .weather-table button {
                  border: none;
                  background-color: transparent;
                  cursor: pointer;
                  color: #4a90e2; /* Match the header color or any theme color */
                  font-size: 15px; /* Smaller font size for the buttons */
                  padding: 4px 6px; /* Reduce padding to decrease overall button size */
                  display: inline-block; /* Ensures padding and margin are respected */
                  margin: 10px;
              }
              .weather-table button:hover {
                  color: #d33; /* Some contrast color for hover state */
              }
          </style>
          <thead>
              <tr>
                  <th data-type="date">Date</th>
                  <th data-type="number">Temperature (°C)</th>
                  <th data-type="number">Temperature (°F)</th>
                  <th data-type="text">Summary</th>
                  <th>Actions</th>
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
    // Only add click event if header has a 'data-type' attribute
    this.headers.forEach((header) => {
      if (header.hasAttribute("data-type")) {
        header.addEventListener("click", () => {
          const type = header.getAttribute("data-type") as string;
          const column = header.textContent || "";
          const isAsc =
            this.currentSort.column === column && this.currentSort.asc;
          this.currentSort = { column, asc: !isAsc };

          // TODO: Figure out why this has no effect:
          this.table!.classList.add("sorting"); // Add sorting class to trigger animations
          weatherDataManager.sortData(column, type, !isAsc);

          this.updateSortIndicator(this.headers, header, !isAsc);

          // TODO: Figure out why this has no effect:
          requestAnimationFrame(() => {
            this.table!.classList.remove("sorting"); // Remove sorting class after reflow
          });
        });
      }
    });
  }

  render(): HTMLElement {
    const weatherData = weatherDataManager.getState(); // Get current state

    const tbody = this.table!.querySelector("tbody");
    if (tbody) {
      this.populateRows(weatherData, tbody);
    } else {
      console.error("Failed to find tbody element");
    }

    this.innerHTML = ""; // Clear existing contents
    this.appendChild(this.div!); // Append the new table
    return this.table!;
  }

  populateRows(data: any[], tbody: HTMLTableSectionElement): void {
    tbody.innerHTML = ""; // Clear existing rows
    data.forEach((entry) => {
      const row = tbody.insertRow();

      // Create and append date cell
      const dateCell = row.insertCell();
      dateCell.textContent = entry.date;

      // Create and append temperature in Celsius cell
      const tempCCell = row.insertCell();
      tempCCell.textContent = entry.temperatureC;

      // Create and append temperature in Fahrenheit cell
      const tempFCell = row.insertCell();
      tempFCell.textContent = entry.temperatureF;

      // Create and append summary cell
      const summaryCell = row.insertCell();
      summaryCell.textContent = entry.summary;

      // Create and append actions cell with buttons
      const actionsCell = row.insertCell();

      // Edit button
      const editBtn = document.createElement("button");
      editBtn.className = "edit-btn";
      editBtn.innerHTML = '<i class="fas fa-edit"></i>';

      const id = entry.id;

      editBtn.addEventListener("click", () => {
        const entry: any = weatherDataManager
          .getState()
          .find((item) => item.id === id);

        this.showWeatherPageEditDialog(false, id);
      });
      actionsCell.appendChild(editBtn);

      // Delete button
      const deleteBtn = document.createElement("button");
      deleteBtn.className = "delete-btn";
      deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
      deleteBtn.addEventListener("click", () => this.deleteItem(id));
      actionsCell.appendChild(deleteBtn);
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

  deleteItem(id: number) {
    console.log("Delete item with ID:", id);
    weatherDataManager.removeData(id);
  }
}

const WEATHER_TABLE_TAG = "weather-table";
if (!customElements.get(WEATHER_TABLE_TAG)) {
  customElements.define(WEATHER_TABLE_TAG, WeatherTable);
}
