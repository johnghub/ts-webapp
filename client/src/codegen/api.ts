import { appConfig } from "../appconfig";
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
    const response = await fetch(
      `${appConfig.domain}/api/weatherforecast/getweatherforecast?`,
      { method: "get" }
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
export interface UserCredentialsParamType {
  Username: string;
  Password: string;
}
export async function Login(
  credentials: UserCredentialsParamType
): Promise<ApiResponse<boolean>> {
  try {
    const response = await fetch(`${appConfig.domain}/api/auth/login`, {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
    if (!response.ok) {
      return { error: `Failed with status code: ${response.status}` };
    }
    const data: boolean = await response.json();
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
      body: JSON.stringify({}),
    });
    if (!response.ok) {
      return { error: `Failed with status code: ${response.status}` };
    }
    const data: void = await response.json();
    return { data };
  } catch (error) {
    return { error: "Failed to fetch data" };
  }
}
export async function AccessDenied(): Promise<ApiResponse<void[]>> {
  try {
    const response = await fetch(
      `${appConfig.domain}/api/errors/access-denied?`,
      { method: "get" }
    );
    if (!response.ok) {
      return { error: `Failed with status code: ${response.status}` };
    }
    const data: void[] = await response.json();
    return { data };
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
  request: WeatherRequestParamType
): Promise<ApiResponse<WeatherData[]>> {
  try {
    const response = await fetch(
      `${appConfig.domain}/api/weather/getweather?request=${request}`,
      { method: "get" }
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
