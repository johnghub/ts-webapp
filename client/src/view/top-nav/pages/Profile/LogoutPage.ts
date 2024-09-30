import { AUTH_PROXY_TAG, LOGOUT_SUCCESS_MSG } from "../../../../common";
import { AuthProxyService } from "../../../main/components";

export default class LogoutPage extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    document.addEventListener(LOGOUT_SUCCESS_MSG, this.processLogout);
    this.appendChild(this.render());
    this.handleLogout();
  }

  disconnectedCallback() {
    document.removeEventListener(LOGOUT_SUCCESS_MSG, this.processLogout);
  }

  handleLogout = () => {
    const authProxy = document.querySelector(
      AUTH_PROXY_TAG
    ) as AuthProxyService;
    if (authProxy) {
      authProxy.logout();
    }
  };

  processLogout() {
    window.location.href = "/";
  }

  render(): HTMLElement {
    const page = document.createElement("logoutpage");
    page.innerHTML = `
            <style>
                .about-page-style {
                    display: block;
                    padding: 16px;
                    background-color: #f0f0f0;  // Light grey background
                    color: black;  // Black text
                    font-size: 24px;  // Larger text for visibility
                }
            </style>
            <div">Logging out...</div>
        `;
    return page;
  }
}

const LOGOUT_ELEMENT_TAG = "logout-page";
// Define the custom element
if (!customElements.get(LOGOUT_ELEMENT_TAG))
  customElements.define(LOGOUT_ELEMENT_TAG, LogoutPage);
