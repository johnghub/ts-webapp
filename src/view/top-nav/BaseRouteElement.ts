class BaseRouteElement extends HTMLElement {
  constructor() {
    super();
  }

  get path(): string | null {
    return this.getAttribute("path");
  }

  get component(): string | null {
    return this.getAttribute("component");
  }
}
