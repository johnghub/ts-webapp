// Define RouteElement as a custom element with path and component attributes.
export class RouteElement extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.updateFullPath();
  }

  get isVisible(): boolean {
    const style = window.getComputedStyle(this);
    return (
      style.display !== "none" &&
      style.visibility !== "hidden" &&
      style.opacity !== "0"
    );
  }

  updateFullPath() {
    let path = this.getAttribute("path") || "";
    let parentElement = this.parentElement;

    while (parentElement && parentElement instanceof RouteElement) {
      const parentPath = parentElement.getAttribute("path");
      if (parentPath) {
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

const ROUTE_ELEMENT_TAG = "route-element";

if (!customElements.get(ROUTE_ELEMENT_TAG))
  customElements.define(ROUTE_ELEMENT_TAG, RouteElement);
