import { RouteElement } from "./routeelement";

interface AuthDetail {
  isAuthenticated: boolean;
}

// Define the AuthenticatedRoute as a subclass of RouteElement
class AuthenticatedRoute extends RouteElement {
  constructor() {
    super(); // Call the constructor of the base class
    this.handleAuthChange = this.handleAuthChange.bind(this);
  }

  connectedCallback() {
    super.connectedCallback(); // Ensure base class logic is executed
    this.updateVisibilityX(this.isAuthenticatedInitially()); // Update visibility based on initial authentication state
    document.addEventListener("auth-change", this.handleAuthChange);
  }

  disconnectedCallback() {
    document.removeEventListener("auth-change", this.handleAuthChange);
  }

  handleAuthChange = (event: Event) => {
    // Update visibility based on authentication state
    if (
      (event as CustomEvent<AuthDetail>).detail.isAuthenticated !== undefined
    ) {
      this.updateVisibilityX(
        (event as CustomEvent<AuthDetail>).detail.isAuthenticated
      );
    }
  };

  updateVisibilityX(isAuthenticated: boolean) {
    // Use the passed isAuthenticated value to update display
    //    this.style.display = isAuthenticated ? "block" : "none";
    return true;
  }

  isAuthenticatedInitially(): boolean {
    // Implement logic to determine if the user is initially authenticated
    // This could be reading from a global state or checking a cookie/localStorage
    // For demonstration, returning false as default
    return false;
  }
}

if (!customElements.get("authenticated-route")) {
  customElements.define("authenticated-route", AuthenticatedRoute);
}
