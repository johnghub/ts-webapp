// Define the types for user data and event details
interface UserData {
  user: string | null;
  isAuthenticated: boolean;
}

interface AuthEventDetail extends UserData {
  error?: string;
}

// Define the class for the AuthProxyService
export class AuthProxyService extends HTMLElement {
  // Method to handle login
  login(username: string, password: string): void {
    const body = JSON.stringify({ username, password });

    fetch("https://localhost:7129/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: body,
    })
      .then((response) => this.handleResponse(response))
      .then((data) => this.processLogin(data as UserData))
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
      .then((response) => this.handleResponse(response))
      .then((data) => this.processLogout(data as UserData))
      .catch((error) => this.handleError(error, LOGOUT_FAILURE_MSG));
  };

  // Handle network responses
  private handleResponse = (response: Response): Promise<UserData> => {
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return response.json();
  };

  // Handle successful login
  private processLogin = (data: UserData): void => {
    const eventDetail: AuthEventDetail = {
      user: data.user,
      isAuthenticated: data.isAuthenticated,
    };

    if (data.isAuthenticated) {
      this.dispatchEvent(
        new CustomEvent<AuthEventDetail>(LOGIN_SUCCESS_MSG, {
          detail: eventDetail,
          bubbles: true,
          composed: true,
        })
      );
    } else {
      this.dispatchEvent(
        new CustomEvent<AuthEventDetail>(LOGIN_FAILURE_MSG, {
          detail: eventDetail,
          bubbles: true,
          composed: true,
        })
      );
    }
  };

  // Handle successful logout
  private processLogout = (data: UserData): void => {
    const eventDetail: AuthEventDetail = {
      user: null,
      isAuthenticated: data.isAuthenticated,
    };

    if (data.isAuthenticated) {
      this.dispatchEvent(
        new CustomEvent<AuthEventDetail>(LOGOUT_SUCCESS_MSG, {
          detail: eventDetail,
          bubbles: true,
          composed: true,
        })
      );
    } else {
      this.dispatchEvent(
        new CustomEvent<AuthEventDetail>(LOGOUT_FAILURE_MSG, {
          detail: eventDetail,
          bubbles: true,
          composed: true,
        })
      );
    }
  };

  // Handle errors
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
}

// Constants for event names and element tag
const LOGIN_SUCCESS_MSG = "login-success";
const LOGIN_FAILURE_MSG = "login-failure";
const LOGOUT_SUCCESS_MSG = "logout-success";
const LOGOUT_FAILURE_MSG = "logout-failure";
const AUTH_PROXY_TAG = "auth-proxy-service";

// Ensure the custom element is defined only once
if (!customElements.get(AUTH_PROXY_TAG)) {
  customElements.define(AUTH_PROXY_TAG, AuthProxyService);
}
