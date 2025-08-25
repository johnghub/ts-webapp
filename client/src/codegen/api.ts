import { appConfig } from "../appconfig";
import { LoginResponse } from "../view/main/components/services/network/AuthProxyService";
export interface ApiResponse<T> {
  data?: T;
  error?: string;
}
export interface WeatherForecast {
  Id: number;
  Date: any;
  TemperatureC: number;
  TemperatureF: number;
  Summary: string;
}
export async function GetWeatherForecast(): Promise<
  ApiResponse<WeatherForecast[]>
> {
  try {
    const query = ``;
    const response = await fetch(
      `${appConfig.domain}/api/weatherforecast/getweatherforecast?${query}`,
      {
        method: "get",
        // TODO: Include credentials if needed using autogen code
      }
    );
    if (!response.ok) {
      return { error: `Failed with status code: ${response.status}` };
    }
    const data: WeatherForecast[] = await response.json();
    return { data };
  } catch (error) {
    return { error: "Failed to fetch data" };
  }
}
export interface UserCredentialsParamType {}
export async function Login(
  credentials: any
): Promise<ApiResponse<LoginResponse>> {
  try {
    const response = await fetch(`${appConfig.domain}/api/auth/login`, {
      method: "post",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      return { error: `Failed with status code: ${response.status}` };
    }
    // TODO: Data should be structured by codegen to return a sucess property as true or false

    const data: LoginResponse = await response.json();
    return { data };
  } catch (error) {
    return { error: "Failed to fetch data" };
  }
}
export async function Logout(): Promise<ApiResponse<void>> {
  try {
    const response = await fetch(`${appConfig.domain}/api/auth/logout`, {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: "",
    });
    if (!response.ok) {
      return { error: `Failed with status code: ${response.status}` };
    }
    return { data: undefined };
  } catch (error) {
    return { error: "Failed to fetch data" };
  }
}
export async function AccessDenied(): Promise<ApiResponse<void[]>> {
  try {
    const query = ``;
    const response = await fetch(
      `${appConfig.domain}/api/errors/access-denied?${query}`,
      { method: "get" }
    );
    if (!response.ok) {
      return { error: `Failed with status code: ${response.status}` };
    }
    return { data: undefined };
  } catch (error) {
    return { error: "Failed to fetch data" };
  }
}
export interface WeatherData {
  Temperature: string;
  Condition: string;
}
export interface WeatherRequestParamType {
  Location: string;
}
export async function GetWeather(
  Location: string
): Promise<ApiResponse<WeatherData[]>> {
  try {
    const query = `Location=${Location}`;
    const response = await fetch(
      `${appConfig.domain}/api/weather/getweather?${query}`,
      { method: "get", credentials: "include" }
    );
    if (!response.ok) {
      return { error: `Failed with status code: ${response.status}` };
    }
    const data: WeatherData[] = await response.json();
    return { data };
  } catch (error) {
    return { error: "Failed to fetch data" };
  }
}
