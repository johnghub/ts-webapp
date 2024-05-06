// src/components/NavBar2.ts
import { IConnectedCallback } from "../";
import { IRenderable } from "../";
import { capitalizeFirstLetter } from "../../../common";

export class NavBar
  extends HTMLElement
  implements IRenderable, IConnectedCallback
{
  constructor() {
    super();
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

    const routeElements = appRouter.querySelectorAll("route-element");
    const nav = document.createElement("nav");
    if (nav) {
      nav.innerHTML = ""; // Clear existing links
      routeElements.forEach((route) => {
        const path = route.getAttribute("path");
        const anchor = document.createElement("a");
        anchor.href = path || "/";
        anchor.dataset.path = path || "/";
        anchor.textContent = capitalizeFirstLetter(
          path?.replace("/", "") || "home"
        );
        nav.appendChild(anchor);
      });
    }

    return nav;
  }
}

if (!customElements.get("nav-bar")) customElements.define("nav-bar", NavBar);
