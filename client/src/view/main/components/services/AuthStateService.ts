import { AUTH_STATE_SERVICE_TAG } from "../../../../common";
import { ServiceBase } from "./ServiceBase";

export class AuthStateService extends ServiceBase implements IAuthStateService {
  private _authState: { isAuthenticated: boolean } = { isAuthenticated: false };

  constructor() {
    super();
  }

  connectedCallback(): void {
    document.addEventListener("login-success", this.handleLoginSuccess);
  }

  handleLoginSuccess = (event: CustomEvent): void => {
    this.updateAuthState(event.detail.isAuthenticated);
  };

  updateAuthState(isAuthenticated: boolean): void {
    this._authState = { isAuthenticated };
    this.dispatchEventState();
  }

  dispatchEventState(): void {
    this.dispatchEvent(
      new CustomEvent(AUTH_STATE_CHANGED_MSG, {
        detail: { ...this._authState },
        bubbles: true,
        composed: true,
      })
    );
  }

  isAuthenticated = (): boolean => {
    return this._authState.isAuthenticated;
  };

  disconnectedCallback(): void {
    document.removeEventListener("login-success", this.handleLoginSuccess);
  }

  static get tagName(): string {
    return AUTH_STATE_SERVICE_TAG;
  }
}

export interface IAuthStateService {
  isAuthenticated(): boolean;
}

// Messages
export const AUTH_STATE_CHANGED_MSG = "auth-state-changed";

if (!customElements.get(AUTH_STATE_SERVICE_TAG))
  customElements.define(AUTH_STATE_SERVICE_TAG, AuthStateService);
