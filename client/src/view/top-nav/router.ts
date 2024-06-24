import { getLastPathSegment } from "../../common/infrastructure/stringUtils";
import { LoginDialog } from "./LoginDialog";
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
    const routeElements: NodeListOf<HTMLElement> =
      this.querySelectorAll("route-element");
    routeElements.forEach((element) => {
      this.registerRoute(element);
    });

    const notFoundName = "NotFoundPage";
    this.components[notFoundName] = () => import(`./pages/${notFoundName}`);
  }

  registerRoute(route: RouteElement) {
    // Ensure fullPath is called on the route element, not 'this' which refers to the router
    const path = route.fullPath || "notfound";
    const componentName = route.getAttribute("component");
    if (componentName) {
      const importPath = this.convertPathToDirectory(path, componentName);
      this.components[componentName] = () => import(`${importPath}`); //
    }
  }

  convertPathToDirectory(fullPath: string, componentName: string): string {
    // Split the path into segments and remove the last segment
    const pathSegments = fullPath.split("/").filter(Boolean);
    pathSegments.pop(); // Remove the last segment which is typically the component name
    const directoryPath = pathSegments.join("/"); // Re-join the remaining segments to form the directory path
    //const fileName = `${componentName}.ts`; // Construct the filename, need the '.ts' extension for Vite static analysis
    const fileName = `${componentName}`; // Construct the filename, need the '.ts' extension for Vite static analysis
    return `./pages/${directoryPath ? directoryPath + "/" : ""}${fileName}`;
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
    const uniquePath: string = getLastPathSegment(path);
    const routeElement = this.querySelector(
      `route-element[path="${uniquePath}"]`
    ) as RouteElement;

    if (!routeElement) {
      // Prevent recursive loading if already on NotFound page
      if (uniquePath !== "/notfound") {
        history.pushState({}, "", "/notfound");
        this.dispatchEvent(new CustomEvent("route-change", { bubbles: true })); // Trigger the route change again
        return; // Exit the function to avoid loading below in this cycle
      }
    }

    if (routeElement && routeElement.dataset.action === "open-login-dialog") {
      const loginDialog = document.querySelector("login-dialog") as LoginDialog;
      if (loginDialog) {
        loginDialog.show(); // Assuming login-dialog has a show method
        return; // Stop further processing to just show the dialog
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
