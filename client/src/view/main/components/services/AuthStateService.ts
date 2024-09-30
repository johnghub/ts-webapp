import {
  AUTH_STATE_CHANGED_MSG,
  AUTH_STATE_SERVICE_TAG,
  LOGIN_SUCCESS_MSG,
  LOGOUT_SUCCESS_MSG,
} from "../../../../common";
import { ServiceBase } from "./ServiceBase";

export class AuthStateService extends ServiceBase implements IAuthStateService {
  private _authState: { isAuthenticated: boolean } = { isAuthenticated: false };

  constructor() {
    super();
  }

  connectedCallback(): void {
    document.addEventListener(LOGIN_SUCCESS_MSG, this.handleLoginSuccess);
    document.addEventListener(LOGOUT_SUCCESS_MSG, this.handleLogoutSuccess);
  }

  disconnectedCallback(): void {
    document.removeEventListener(LOGIN_SUCCESS_MSG, this.handleLoginSuccess);
    document.removeEventListener(LOGOUT_SUCCESS_MSG, this.handleLogoutSuccess);
  }

  handleLoginSuccess = (event: CustomEvent): void => {
    this.updateAuthState(event.detail.isAuthenticated);
  };

  handleLogoutSuccess = (event: CustomEvent): void => {
    this.updateAuthState(false);
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

  static get tagName(): string {
    return AUTH_STATE_SERVICE_TAG;
  }
}

export interface IAuthStateService {
  isAuthenticated(): boolean;
}

if (!customElements.get(AUTH_STATE_SERVICE_TAG))
  customElements.define(AUTH_STATE_SERVICE_TAG, AuthStateService);
