import { GetWeather, WeatherRequestParamType } from "../../../codegen/api";
import { AUTH_STATE_SERVICE_TAG } from "../../../common";
import { IConnectedCallback } from "../../main";
import { IRenderable } from "../../main";

export default class AuthWeatherPage
  extends HTMLElement
  implements IConnectedCallback, IRenderable
{
  private _weatherData: { condition: string; temperature: string } | null =
    null;

  constructor() {
    super();
    this.renderInitial();
  }
  async connectedCallback(): Promise<void> {
    await this.fetchWeatherData();
    this.appendChild(this.render());
  }

  renderInitial() {
    this.innerHTML = `<p>Loading weather data...</p>`;
  }

  async fetchWeatherData() {
    try {
      const request: WeatherRequestParamType = { Location: "ValidLocation" }; // Create the request object for the API
      const response = await GetWeather(request.Location);

      if (response.error) {
        console.error("Error fetching weather data:", response.error);
        this.renderError(response.error);
      } else if (response.data) {
        this._weatherData = response.data;
      }
    } catch (error: any) {
      console.error("Unexpected error fetching weather data:", error);
      this.renderError(error.message);
    }
  }

  // async fetchWeatherData() {
  //   try {
  //     const response = await fetch(
  //       "https://localhost:7129/api/weather/getweather?Location=ValidLocation",
  //       {
  //         method: "GET",
  //         credentials: "include", // Ensures cookies are sent with the request for authentication
  //       }
  //     );

  //     if (!response.ok) {
  //       throw new Error("Failed to fetch weather data");
  //     }

  //     this._weatherData = await response.json();
  //   } catch (error: any) {
  //     console.error("Error fetching weather data:", error);
  //     this.renderError(error.message);
  //   }
  // }

  renderError(errorMessage: string) {
    this.innerHTML = `
        <div>
            <h2>Error</h2>
            <p>${errorMessage}</p>
        </div>
    `;
  }

  render(): HTMLElement {
    const page = document.createElement("authweatherpage");
    const isAuthenticated = (
      document.querySelector(AUTH_STATE_SERVICE_TAG) as any
    ).isAuthenticated();

    if (isAuthenticated) {
      const page = document.createElement("authweatherpage");
      page.innerHTML = `
            <style>
                .about-page-style {
                    display: block;
                    padding: 16px;
                    background-color: #808080;  // Light grey background
                    color: black;  // Black text
                    font-size: 24px;  // Larger text for visibility
                }
            </style>
            <div"><b>Current weather</b>:<p>Condition: ${this._weatherData?.condition}<br />Temperature: ${this._weatherData?.temperature}</p></div>`;
      return page;
    } else
      page.innerHTML = `
            <style>
                .about-page-style {
                    display: block;
                    padding: 16px;
                    background-color: #AA0000;  // Light grey background
                    color: white;  // Black text
                    font-size: 24px;  // Larger text for visibility
                }
            </style>
            <div">Not authenticated for the auth weather page</div>`;
    return page;
  }
}

const AUTHWEATHER_PAGE_TAG = "authweather-page";
// Define the custom element
if (!customElements.get(AUTHWEATHER_PAGE_TAG))
  customElements.define(AUTHWEATHER_PAGE_TAG, AuthWeatherPage);
