// Define RouteElement as a custom element with path and component attributes.
export class RouteElement extends HTMLElement {
  constructor() {
    super();
  }

  // Getter for 'path' attribute
  get path(): string | null {
    return this.getAttribute("path");
  }

  // Getter for 'component' attribute
  get component(): string | null {
    return this.getAttribute("component");
  }
}

if (!customElements.get("route-element"))
  customElements.define("route-element", RouteElement);
