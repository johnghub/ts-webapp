import { LOGOUT_SUCCESS_MSG } from "../../../../common";

export default class LogoutPage extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.appendChild(this.render());
    this.handleLogout();
  }

  disconnectedCallback() {
    //document.removeEventListener("click", this.handleLogout);
  }

  handleLogout = async () => {
    try {
      const response = await fetch("https://localhost:7129/api/auth/logout", {
        method: "POST",
      });
      if (response.ok) {
        // Successfully logged out
        this.dispatchEvent(
          new CustomEvent(LOGOUT_SUCCESS_MSG, { bubbles: true })
        );
        // Optionally redirect to homepage or login page
        window.location.href = "/";
      } else {
        throw new Error("Logout failed");
      }
    } catch (error) {
      console.error("Error during logout:", error);
      this.dispatchEvent(new CustomEvent("logout-failed", { bubbles: true }));
    }
  };

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
