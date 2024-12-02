import { Login, UserCredentialsParamType } from "../../../../../codegen/api";
import {
  AUTH_PROXY_TAG,
  LOGIN_FAILURE_MSG,
  LOGIN_SUCCESS_MSG,
  LOGOUT_FAILURE_MSG,
  LOGOUT_SUCCESS_MSG,
} from "../../../../../common";

// Define the types for user data and event details
interface UserData {
  user: string | null;
  isAuthenticated: boolean;
}

interface AuthEventDetail extends UserData {
  error?: string;
  success: boolean;
}

// Define the class for the AuthProxyService
export class AuthProxyService extends HTMLElement {
  // Method to handle login
  //async formLogin(body: string): Promise<void> {
  // async formLogin(body: UserCredentialsParamType): Promise<void> {
  //   const response = await Login(body);

  //   if (response.error) {
  //     this.handleError(response.error, LOGIN_FAILURE_MSG);
  //   } else if (response.data) {
  //     this.processLogin({ success: response.data } as AuthEventDetail);
  //   }
  // }

  formLogin(body: string): void {
    fetch("https://localhost:7129/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: body,
    })
      .then((response) => this.handleLoginResponse(response))
      .then((data) => this.processLogin(data as AuthEventDetail))
      .catch((error) => this.handleError(error, LOGIN_FAILURE_MSG));
  }

  // Method to handle logout
  logout = (): void => {
    fetch("https://localhost:7129/api/auth/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => this.handleLogoutResponse(response))
      .catch((error) => this.handleError(error, LOGOUT_FAILURE_MSG));
  };

  // Handle network responses
  private handleLoginResponse = (response: Response): Promise<UserData> => {
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return response.json();
  };

  private handleLogoutResponse = (response: Response): void => {
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    this.processLogout();
  };

  // Handle successful login
  private processLogin = (data: AuthEventDetail): void => {
    if (data.success) {
      data.isAuthenticated = true;
      this.dispatchEvent(
        new CustomEvent<AuthEventDetail>(LOGIN_SUCCESS_MSG, {
          detail: data, //eventDetail,
          bubbles: true,
          composed: true,
        })
      );
    } else {
      data.isAuthenticated = false;
      this.dispatchEvent(
        new CustomEvent<AuthEventDetail>(LOGIN_FAILURE_MSG, {
          detail: data, //1eventDetail,
          bubbles: true,
          composed: true,
        })
      );
    }
  };

  // Handle successful logout
  private processLogout = (): void => {
    this.dispatchEvent(
      new CustomEvent<AuthEventDetail>(LOGOUT_SUCCESS_MSG, {
        bubbles: true,
      })
    );
  };

  // Handle errors
  //  private handleError = (message: string, eventType: string): void => {
  private handleError = (error: Error, eventType: string): void => {
    console.error("Authentication error:", error.message);
    this.dispatchEvent(
      new CustomEvent<AuthEventDetail>(eventType, {
        detail: { error: error.message },
        bubbles: true,
        composed: true,
      })
    );
  };

  // private handleError = (error: Error, eventType: string): void => {
  //   console.error("Authentication error:", error.message);
  //   this.dispatchEvent(
  //     new CustomEvent<AuthEventDetail>(eventType, {
  //       detail: { error: error.message },
  //       bubbles: true,
  //       composed: true,
  //     })
  //   );
  // };
}

// Ensure the custom element is defined only once
if (!customElements.get(AUTH_PROXY_TAG)) {
  customElements.define(AUTH_PROXY_TAG, AuthProxyService);
}
