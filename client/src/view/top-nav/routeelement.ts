// Define RouteElement as a custom element with path and component attributes.
export class RouteElement extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.updateFullPath();
    // Listen to a global authentication change event
    //    window.addEventListener('auth-change', this.handleAuthChange);
  }

  disconnectedCallback() {
    // Remove the event listener when the element is removed from the DOM
    //    window.removeEventListener('auth-change', this.handleAuthChange);
  }

  handleAuthChange = () => {
    // Update visibility based on the new authentication state
    //    this.updateVisibility();
  };

  get isVisible(): boolean {
    //return this.checkAuthentication() && this.meetsAuthRequirement();
    return this.meetsAuthRequirement();
  }

  meetsAuthRequirement(): boolean {
    const ownAuth = this.hasAttribute("auth");
    const parentAuthContainer = Boolean(this.closest("auth-container"));
    return (!ownAuth && !parentAuthContainer) || this.checkAuthentication();
  }

  checkAuthentication(): boolean {
    // Implement the actual authentication logic here
    return false; // Placeholder: replace with actual logic
  }

  updateFullPath() {
    let path = this.getAttribute("path") || "";
    let parentElement = this.parentElement;

    while (parentElement && parentElement instanceof RouteElement) {
      const parentPath = parentElement.getAttribute("path");
      if (parentPath) {
        //        path = `${parentPath}/${path}`;
        if (path.startsWith("/")) {
          path = path.substring(1);
        }
        // Ensure parent path does not have a trailing slash
        const normalizedParentPath = parentPath.endsWith("/")
          ? parentPath.slice(0, -1)
          : parentPath;
        path = `${normalizedParentPath}/${path}`;
      }
      parentElement = parentElement.parentElement;
    }

    this.setAttribute("full-path", path);
  }

  get fullPath() {
    return this.getAttribute("full-path");
  }

  get path(): string | null {
    return this.getAttribute("path");
  }

  set path(newValue: string | null) {
    if (newValue) this.setAttribute("path", newValue);
  }

  get component(): string | null {
    return this.getAttribute("component");
  }
}

if (!customElements.get("route-element"))
  customElements.define("route-element", RouteElement);
