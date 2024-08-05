import { IConnectedCallback, IRenderable } from "../main";

export class AuthContainer
  extends HTMLElement
  implements IRenderable, IConnectedCallback
{
  private state: {
    isAuthenticated: boolean;
    user: any | null;
    error?: string;
  } = {
    isAuthenticated: false,
    user: null,
  };

  constructor() {
    super();
    //this.isAuthenticated = this.isAuthenticated.bind(this);
  }

  connectedCallback() {
    // Adding event listener when the component is connected to the document
    this.addEventListener("auth-change", this.handleAuthChange);

    // Listen for the 'login-error' event
    // this.addEventListener("login-error", (event: Event) => {
    //   const customEvent = event as CustomEvent<{ error: string }>; // Type assertion
    //   console.error("Login Error:", customEvent.detail.error);
    // });
  }

  disconnectedCallback(): void {
    // Removing the event listener when the component is disconnected from the document
    this.removeEventListener("auth-change", this.handleAuthChange);
  }

  handleAuthChange = (event: Event): void => {
    // Cast the event to CustomEvent with the expected detail type
    const customEvent = event as CustomEvent<{
      isAuthenticated: boolean;
      user?: any;
      error?: string;
    }>;
    const { isAuthenticated, user, error } = customEvent.detail;

    console.log(
      isAuthenticated ? "User authenticated:" : "Authentication failed",
      customEvent.detail
    );

    // Update internal state immutably
    this.state = {
      ...this.state,
      isAuthenticated,
      user: isAuthenticated ? user : null,
      error: !isAuthenticated ? error : undefined,
    };

    this.updateUI(); // Update UI elements based on the new state
  };

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

  isAuthenticated = (): boolean => {
    return this.state.isAuthenticated;
  };
}

if (!customElements.get("auth-container"))
  customElements.define("auth-container", AuthContainer);
