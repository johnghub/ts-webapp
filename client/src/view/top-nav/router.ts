import { APP_ROUTER_TAG } from "../../common";
import { getLastPathSegment } from "../../common/infrastructure/stringUtils";
import { LoginDialog } from "./LoginDialog";
// import { AboutPage, AdminPage, AuthWeatherPage, NotFoundPage } from "./pages";
// import ContactPage from "./pages/ContactPage";
// import SkiingPage from "./pages/products/SkiingPage";
// import LogoutPage from "./pages/Profile/LogoutPage";
import { RouteElement } from "./routeelement";

type ComponentLoaderMap = {
  [key: string]: () => Promise<{ default: CustomElementConstructor }>;
};

// /top-navigation/router.ts
export class Router extends HTMLElement {
  //private components: ComponentLoaderMap = {};

  private imports = {
    AboutPage: () => import("./pages/AboutPage"),
    ContactPage: () => import("./pages/ContactPage"),
    AdminPage: () => import("./pages/AdminPage"),
    AuthWeatherPage: () => import("./pages/AuthWeatherPage"),
    HomePage: () => import("./pages/HomePage"),
    NotFoundPage: () => import("./pages/NotFoundPage"),
    SkiingPage: () => import("./pages/products/SkiingPage"),
    SkatingPage: () => import("./pages/products/SkatingPage"),
    SwimSuitPage: () => import("./pages/products/SwimSuitPage"),
    LogoutPage: () => import("./pages/Profile/LogoutPage"),
    WeatherPage: () => import("./pages/WeatherPage"),
    //UserPage: () => import ('./pages/Profile/UserPage')
  };

  private components: ComponentLoaderMap = {
    AboutPage: this.imports.AboutPage,
    AdminPage: this.imports.AdminPage,
    AuthWeatherPage: this.imports.AuthWeatherPage,
    ContactPage: this.imports.ContactPage,
    HomePage: this.imports.HomePage,
    LogoutPage: this.imports.LogoutPage,
    SkiingPage: this.imports.SkiingPage,
    SkatingPage: this.imports.SkatingPage,
    WeatherPage: this.imports.WeatherPage,
  };

  private modulePaths = "";

  constructor() {
    super();
  }

  /*

  // Dynamic loading and bundling is a project for another day...
  initializeComponentMap() {
    const routeElements: NodeListOf<HTMLElement> =
      this.querySelectorAll("route-element");
    routeElements.forEach((element) => {
      this.registerRoute(element);
    });

    console.log(this.modulePaths);

    const notFoundName = "NotFoundPage";
    this.components[notFoundName] = () => import(`./pages/${notFoundName}`);
  }

  registerRoute(route: RouteElement) {
    // Ensure fullPath is called on the route element, not 'this' which refers to the router
    const path = route.fullPath || "notfound";
    const componentName = route.getAttribute("component");
    if (componentName) {
      const importPath = this.convertPathToDirectory(path, componentName);
      // console.log(
      //   `component name: ${componentName}, import path: ${importPath}`
      // );
      const stmt = `${componentName}: () => import ('${importPath}')`;
      //console.log(stmt);
      this.modulePaths += `\n${stmt}`;
      this.components[componentName] = () => import(`${importPath}`);
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
  */
  connectedCallback() {
    //this.initializeComponentMap();
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

    // TODO: The logout function should work in a similar way, but just logs out the user, might make sense to load a component to do
    // it or use the proxy service.
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
      console.error(`Failed to load the component ${componentName}:`, error);
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

if (!customElements.get(APP_ROUTER_TAG))
  customElements.define(APP_ROUTER_TAG, Router);
