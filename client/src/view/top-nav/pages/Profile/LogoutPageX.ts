export class LogoutPage extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.addEventListener("click", this.handleLogout);
    this.appendChild(this.render());
  }

  disconnectedCallback() {
    document.removeEventListener("click", this.handleLogout);
  }

  handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:5129/api/auth/logout", {
        method: "POST",
      });
      if (response.ok) {
        // Successfully logged out
        this.dispatchEvent(
          new CustomEvent("logout-success", { bubbles: true })
        );
        // Optionally redirect to homepage or login page
        window.location.href = "/login";
      } else {
        throw new Error("Logout failed");
      }
    } catch (error) {
      console.error("Error during logout:", error);
      this.dispatchEvent(new CustomEvent("logout-failed", { bubbles: true }));
    }
  };

  render(): HTMLElement {
    const page = document.createElement("skiingpage");
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
            <div">Logout page</div>
        `;
    return page;
  }
}

const LOGOUT_ELEMENT_TAG = "logout-page";
// Define the custom element
if (!customElements.get(LOGOUT_ELEMENT_TAG))
  customElements.define(LOGOUT_ELEMENT_TAG, LogoutPage);
