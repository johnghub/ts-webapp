import { IConnectedCallback, IRenderable } from "../../main";
import { weatherDataManager } from "../../main/components";
import { WeatherPageFilterDialog } from "./WeatherPageFilterDialog";

export default class WeatherTable
  extends HTMLElement
  implements IRenderable, IConnectedCallback
{
  private currentSort = { column: "", asc: true };
  private table: HTMLTableElement;
  private div: HTMLDivElement;

  // Create a mapping from column header text to data keys
  private keyMap: { [key: string]: string } = {
    Date: "date",
    "Temperature (°C)": "temperatureC",
    "Temperature (°F)": "temperatureF",
    Summary: "summary",
  };

  constructor() {
    super();
    this.initTable();
  }

  connectedCallback(): void {
    this.fetchAndDisplayWeather();
    weatherDataManager.subscribe(() => this.render());

    //this.table
    this.div
      .querySelector("#filterBtn")!
      .addEventListener("click", () => this.showWeatherPageFilterDialog());
    document.addEventListener("apply-filter", (event) =>
      this.handleFilter(event)
    );
  }

  disconnectedCallback(): void {
    weatherDataManager.unsubscribe(() => this.render());
    this.querySelector("#filterBtn")!.removeEventListener("click", () =>
      this.showWeatherPageFilterDialog()
    );
    document.removeEventListener("apply-filter", (event) =>
      this.handleFilter(event)
    );
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
    const { filterType, filterInput } = event.detail;
    console.log(`Filtering by ${filterType} for value ${filterInput}`);
    // Implement your filtering logic here
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
    const btn = document.createElement("button");
    btn.id = "filterBtn";
    btn.innerText = "Filter";
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

    this.div.appendChild(btn);
    this.div.appendChild(this.table);
  }

  render(): HTMLElement {
    const weatherData = weatherDataManager.getState(); // Get current state

    const tbody = this.table.querySelector("tbody");
    if (tbody) {
      this.populateRows(weatherData, tbody);
    } else {
      console.error("Failed to find tbody element");
    }

    const headers = this.table.querySelectorAll("th");
    headers.forEach((header) => {
      header.addEventListener("click", () => {
        const type = header.getAttribute("data-type") as string;
        const column = header.textContent || "";
        const isAsc =
          this.currentSort.column === column && this.currentSort.asc;
        this.currentSort = { column, asc: !isAsc };

        this.sortData(weatherData, column, type, !isAsc);
        const tbody = this.table.querySelector("tbody");
        if (tbody) {
          this.populateRows(weatherData, tbody);
        } else {
          console.error("Failed to find tbody element");
        }
        this.updateSortIndicator(headers, header, !isAsc);
      });
    });

    this.innerHTML = ""; // Clear existing contents
    //this.appendChild(this.table); // Append the new table
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

  sortData(data: any[], column: string, type: string, asc: boolean): void {
    // Use the map to get the correct data key
    const key = this.keyMap[column];

    data.sort((a, b) => {
      let aValue = a[key];
      let bValue = b[key];

      if (type === "number") {
        // Convert to numbers if the type is number
        aValue = Number(aValue);
        bValue = Number(bValue);
      } else if (type === "date") {
        // Convert to date objects if the type is date
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      // Compare values for sorting
      if (aValue < bValue) return asc ? -1 : 1;
      if (aValue > bValue) return asc ? 1 : -1;
      return 0;
    });
  }

  updateSortIndicator(
    headers: NodeListOf<HTMLElement>,
    activeHeader: HTMLElement,
    asc: boolean
  ): void {
    headers.forEach((header) => {
      header.classList.remove("asc", "desc");
    });
    activeHeader.classList.add(asc ? "asc" : "desc");
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
