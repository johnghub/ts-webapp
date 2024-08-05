// Define RouteElement as a custom element with path and component attributes.
export class RouteElement extends HTMLElement {
  static get observedAttributes() {
    return ["auth-visible"];
  }

  constructor() {
    super();
  }

  connectedCallback() {
    this.updateFullPath();
    // Delay the authentication check until the whole window is loaded
    // if (document.readyState === "complete") {
    //   this.updateVisibility();
    // } else {
    //   window.addEventListener("load", () => this.updateVisibility(), {
    //     once: true,
    //   });
    // }
    document.addEventListener("auth-change", this.handleAuthChange);
  }

  disconnectedCallback() {
    document.removeEventListener("auth-change", this.handleAuthChange);
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (name === "data-auth-visible") {
      this.updateVisibility();
    }
  }

  handleAuthChange = (event: Event) => {
    this.updateVisibility();
  };

  updateVisibility() {
    const visibility = this.getAttribute("data-auth-visible");
    const isAuthenticated = (document.querySelector("auth-container") as any)
      .isAuthenticated;

    if (
      isAuthenticated &&
      typeof isAuthenticated === "function" &&
      visibility
    ) {
      const authroutes = document.querySelectorAll(
        "route-element[data-auth-visible]"
      );
      authroutes.forEach((authroute) => {
        // if (isAuthenticated()) {
        //     dropdown.classList.add('visible');
        // } else {
        //     dropdown.classList.remove('visible');
        // }

        switch (visibility) {
          case "authenticated":
            //authroute.classList.add("visible");
            authroute.style.display = isAuthenticated()
              ? "inline-block"
              : "none";
            break;
          case "anonymous":
            //authroute.classList.remove("visible");
            authroute.style.display = !isAuthenticated()
              ? "inline-block"
              : "none";
            break;
          default:
          // Treat "always" or any other unspecified case as default, meaning "anonymous"
        }
      });
    }
  }

  get isVisible(): boolean {
    const style = window.getComputedStyle(this);
    return (
      style.display !== "none" &&
      style.visibility !== "hidden" &&
      style.opacity !== "0"
    );
  }

  // meetsAuthRequirement(): boolean {
  //   const ownAuth = this.hasAttribute("auth");
  //   const parentAuthContainer = Boolean(this.closest("auth-container"));
  //   return (!ownAuth && !parentAuthContainer) || this.checkAuthentication();
  // }

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
