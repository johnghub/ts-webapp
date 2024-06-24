import { IConnectedCallback, IRenderable } from "../main";

export class AuthContainer
  extends HTMLElement
  implements IRenderable, IConnectedCallback
{
  private state: { isAuthenticated: boolean; user: any } = {
    isAuthenticated: false,
    user: null,
  };

  constructor() {
    super();
  }

  connectedCallback() {
    // Listen for the 'login-success' event
    this.addEventListener("login-success", (event: Event) => {
      const customEvent = event as CustomEvent<{ user: any }>; // Type assertion
      console.log("User authenticated:", customEvent.detail.user);
      // Update UI or internal state here
      // Update internal state immutably
      this.state = {
        ...this.state,
        isAuthenticated: true,
        user: customEvent.detail.user,
      };
    });

    // Listen for the 'login-failed' event
    this.addEventListener("login-failed", (event: Event) => {
      const customEvent = event as CustomEvent<{ error: string }>; // Type assertion
      alert("Login Failed: " + customEvent.detail.error);
      // Update internal state immutably
      this.state = {
        ...this.state,
        isAuthenticated: false,
        user: null,
      };
    });

    // Listen for the 'login-error' event
    this.addEventListener("login-error", (event: Event) => {
      const customEvent = event as CustomEvent<{ error: string }>; // Type assertion
      console.error("Login Error:", customEvent.detail.error);
    });
  }

  updateUI() {
    // Fetch the element from the DOM
    const loginDialog = document.getElementById("loginDialog");

    // Check if the element is null and handle it appropriately
    if (loginDialog === null) {
      // Throw an exception if the login dialog does not exist in the DOM
      throw new Error("Login dialog element not found in the DOM.");
    } else {
      // Set the display style based on the authentication state
      loginDialog.style.display = this.state.isAuthenticated ? "none" : "block";
    }
  }

  render(): HTMLElement {
    // Check if the user is authenticated
    const div: HTMLDivElement = document.createElement("div");
    if (this.isAuthenticated()) {
      div.className = "auth-content"; // A class to style authenticated content if needed

      // Append all child nodes of the custom HTML element to the div if authenticated
      this.childNodes.forEach((child) => {
        if (child.nodeType === Node.ELEMENT_NODE) {
          div.appendChild(child.cloneNode(true));
        }
      });
    } else {
      console.log("Authentication required: content hidden");
    }
    return div;
  }

  isAuthenticated(): boolean {
    // Implement authentication check logic here
    // This could involve checking a token or a global auth state
    // For simplicity, this is a placeholder function
    return false; // Replace this with actual authentication logic
  }
}

if (!customElements.get("auth-container"))
  customElements.define("auth-container", AuthContainer);
