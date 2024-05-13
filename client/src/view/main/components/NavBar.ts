import { IConnectedCallback } from "../";
import { IRenderable } from "../";
import { capitalizeFirstLetter } from "../../../common";
import { normalizePath } from "../../../common/infrastructure/stringUtils";
import { RouteElement } from "../../top-nav";

export class NavBar
  extends HTMLElement
  implements IRenderable, IConnectedCallback
{
  constructor() {
    super();
    // Ensure that the method is bound to the instance of the component
  }

  connectedCallback(): void {
    this.appendChild(this.render());
  }

  render(): HTMLElement {
    const nav = this.updateLinks();
    nav.className = "nav-bar";
    return nav;
  }

  updateLinks(): HTMLElement {
    const appRouter = document.querySelector("app-router");
    if (!appRouter) throw new Error("app-router is not defined");

    //const routeElements = appRouter.querySelectorAll("route-element");
    const alignContainers = appRouter.querySelectorAll("align-container");
    const nav = document.createElement("nav");

    if (nav) {
      alignContainers.forEach((container) => {
        const containerDiv = document.createElement("div");
        containerDiv.className = container.getAttribute("alignment") || "left"; // Use alignment for class

        const routeElements = container.querySelectorAll("route-element");

        if (customElements.get("route-element")) {
          // The custom element is defined
          console.error("route is defined, but no route logic is being called");
        } else {
          customElements.whenDefined("route-element").then(() => {
            routeElements.forEach((route: Element) => {
              if ((route as RouteElement).isVisible) {
                if (
                  !route.parentElement ||
                  route.parentElement.tagName.toUpperCase() !== "ROUTE-ELEMENT"
                ) {
                  // It's a top-level route, build the main menu item
                  const menuItem = this.createMenuItem(route);
                  containerDiv.appendChild(menuItem);
                }
              }
            });
          });
        }

        nav.appendChild(containerDiv);
      });
    }

    return nav;
  }

  createMenuItem(routeElement: Element, accumulatedPath = ""): HTMLElement {
    const currentPath = routeElement.getAttribute("path") || "";
    const fullPath = normalizePath(
      accumulatedPath ? `${accumulatedPath}/${currentPath}` : currentPath
    );

    const name = capitalizeFirstLetter(currentPath.replace("/", "") || "home");

    // Get only route-element children
    const routeElementChildren = Array.from(routeElement.children).filter(
      (child) => child.tagName === "ROUTE-ELEMENT"
    );

    if (routeElementChildren.length > 0) {
      // It has nested route-elements, create a dropdown
      const dropdown = document.createElement("div");
      dropdown.className = "dropdown";
      const button = document.createElement("button");
      button.className = "dropbtn";
      button.textContent = name;
      const dropdownContent = document.createElement("div");
      dropdownContent.className = "dropdown-content";

      routeElementChildren.forEach((child) => {
        // Check if the child has its own route-element children
        const childRouteElementChildren = Array.from(child.children).filter(
          (grandchild) => grandchild.tagName === "ROUTE-ELEMENT"
        );

        if (childRouteElementChildren.length > 0) {
          // If nested dropdowns are found, handle the violation
          const violationItem = document.createElement("div");
          violationItem.textContent = `Nesting Not Allowed: ${child.getAttribute(
            "path"
          )}`;
          violationItem.style.color = "red";
          violationItem.style.fontWeight = "bold";
          dropdownContent.appendChild(violationItem);
          console.error(
            `Design Violation: Nested dropdowns are not allowed in the navigation menu. Violation found under '${fullPath}'.`
          );
        } else {
          const childItem = this.createMenuItem(child, fullPath); // Pass accumulated path
          dropdownContent.appendChild(childItem);
        }
      });

      dropdown.appendChild(button);
      dropdown.appendChild(dropdownContent);
      return dropdown;
    } else {
      // No children, create a simple link
      const link = document.createElement("a");
      link.href = fullPath; // Use the full path for the href
      link.textContent = name;
      link.dataset.path = fullPath;
      return link;
    }
  }

  createAnchor(path: string): HTMLAnchorElement {
    const anchor = document.createElement("a");
    anchor.href = path || "/";
    anchor.dataset.path = path || "/";
    anchor.textContent = capitalizeFirstLetter(
      path?.replace("/", "") || "home"
    );
    return anchor;
  }
}

if (!customElements.get("nav-bar")) customElements.define("nav-bar", NavBar);
