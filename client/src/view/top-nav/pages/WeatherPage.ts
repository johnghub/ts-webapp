// Import necessary interfaces and state manager
import { IRenderable } from "../../main";
import { IConnectedCallback } from "../../main";
import { weatherDataManager } from "../../main/components";

export default class WeatherTable
  extends HTMLElement
  implements IRenderable, IConnectedCallback
{
  constructor() {
    super();
  }

  connectedCallback(): void {
    this.fetchAndDisplayWeather();
    // Subscribe to state changes
    weatherDataManager.subscribe(() => this.render());
  }

  disconnectedCallback(): void {
    // Unsubscribe from state changes when the element is removed
    weatherDataManager.unsubscribe(() => this.render());
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

  render(): HTMLElement {
    const weatherData = weatherDataManager.getState(); // Get current state
    const table = document.createElement("table");
    table.innerHTML = `
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
            background-color: #4a90e2; /* Darker blue background */
            color: white; /* White text for contrast */
            font-size: 16px; /* Larger font size */
            font-weight: bold; /* Bold font for emphasis */
            text-shadow: 1px 1px 1px black; /* Text shadow for depth */
        }
        tr:nth-child(even) {
            background-color: #f9f9f9;
        }
    </style>
    <tr>
        <th>Date</th>
        <th>Temperature (°C)</th>
        <th>Temperature (°F)</th>
        <th>Summary</th>
    </tr>
`;

    // Append data rows
    weatherData.forEach((entry) => {
      const row = table.insertRow();
      row.innerHTML = `
                <td>${entry.date}</td>
                <td>${entry.temperatureC}</td>
                <td>${entry.temperatureF}</td>
                <td>${entry.summary}</td>
            `;
    });
    this.innerHTML = ""; // Clear existing contents
    this.appendChild(table); // Append the new table
    return table;
  }
}

// Define the custom element
const WEATHER_TABLE_TAG = "weather-table";
if (!customElements.get(WEATHER_TABLE_TAG)) {
  customElements.define(WEATHER_TABLE_TAG, WeatherTable);
}
