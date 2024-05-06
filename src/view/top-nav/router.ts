import { RouteElement } from "./routeelement";

type ComponentLoaderMap = {
  [key: string]: () => Promise<{ default: CustomElementConstructor }>;
};

// /top-navigation/router.ts
export class Router extends HTMLElement {
  private components: ComponentLoaderMap = {};

  constructor() {
    super();
  }

  initializeComponentMap() {
    const routeElements = this.querySelectorAll("route-element");
    routeElements.forEach((element) => {
      const componentName = element.getAttribute("component");
      if (componentName) {
        this.components[componentName] = () =>
          import(`./pages/${componentName}.ts`);
      }
    });

    const notFoundName = "NotFoundPage";
    this.components[notFoundName] = () => import(`./pages/${notFoundName}.ts`);
  }

  connectedCallback() {
    this.initializeComponentMap();
    if (document.readyState === "complete") {
      this.init();
    } else {
      window.addEventListener("load", () => this.init(), { once: true });
    }
  }

  init() {
    window.addEventListener("popstate", this.handleRouteChange);
    this.addEventListener("route-change", this.handleRouteChange);

    // Initialize view based on current path
    this.handleRouteChange();

    // Add click event listeners to nav links
    this.addNavLinkEventListeners();
  }

  disconnectedCallback() {
    window.removeEventListener("popstate", this.handleRouteChange);
    this.removeEventListener("route-change", this.handleRouteChange);

    // Remove click event listeners from nav links
    this.removeNavLinkEventListeners();
  }

  addNavLinkEventListeners(): void {
    const navBar = this.parentElement;
    if (navBar) {
      const navLinks = navBar.querySelectorAll("nav-bar a"); // Selects only anchor tags within nav-bar
      navLinks.forEach((link) => {
        link.addEventListener("click", (event) =>
          this.handleNavLinkClick(event)
        );
        if (link.tagName === "Home") link.classList.add("clicked");
      });
    } else {
      console.error("nav-bar is not available as the parent element.");
    }
  }

  removeNavLinkEventListeners() {
    const navLinks = document.querySelectorAll("nav-bar a");
    navLinks.forEach((link) => {
      link.removeEventListener("click", (event: Event) =>
        this.handleNavLinkClick(event)
      );
    });
  }

  handleNavLinkClick(event: Event): void {
    event.preventDefault();

    const target = event.target as HTMLAnchorElement; // Safe cast if you're sure it's always an anchor

    // Assuming you handle routing based on the href attribute of the anchor
    const href = target.getAttribute("href");
    if (href) {
      history.pushState({}, "", href);
      this.dispatchEvent(new CustomEvent("route-change"));
    }
  }

  handleRouteChange = async () => {
    const path = window.location.pathname || "/";
    const routeElement = this.querySelector(
      `route-element[path="${path}"]`
    ) as RouteElement;

    if (!routeElement) {
      // Prevent recursive loading if already on NotFound page
      if (path !== "/notfound") {
        history.pushState({}, "", "/notfound");
        this.dispatchEvent(new CustomEvent("route-change", { bubbles: true })); // Trigger the route change again
        return; // Exit the function to avoid loading below in this cycle
      }
    }

    // Determine the correct component to load
    const componentName: string = routeElement?.component || "NotFoundPage";
    const loader =
      this.components[componentName] || this.components["NotFoundPage"];

    try {
      const { default: Component } = await loader();
      this.updatePageArea(new Component());
      this.updateActiveLink();
    } catch (error) {
      console.error("Failed to load the component:", error);
      // Optionally load a hardcoded error component if the NotFoundPage itself fails
    }
  };

  updateActiveLink = () => {
    const currentPath = window.location.pathname;
    const links = document.querySelectorAll("nav-bar a");
    links.forEach((link) => {
      if (link.getAttribute("href") === currentPath) {
        link.classList.add("clicked");
      } else {
        link.classList.remove("clicked");
      }
    });
  };

  updatePageArea(component: HTMLElement) {
    const pageArea = document.querySelector("page-area");
    if (pageArea) {
      pageArea.innerHTML = ""; // Clear existing content
      pageArea.appendChild(component); // Add new component
    }
  }
}

if (!customElements.get("app-router"))
  customElements.define("app-router", Router);
