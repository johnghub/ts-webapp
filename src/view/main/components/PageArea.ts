// src/components/PageArea.ts
import { IConnectedCallback } from "../";
import { IRenderable } from "../";

export class PageArea
  extends HTMLElement
  implements IRenderable, IConnectedCallback
{
  constructor() {
    super();
  }
  connectedCallback(): void {
    this.render();
  }

  render(): HTMLElement {
    const section = document.createElement("section");
    section.textContent = "Page area";
    return section;
  }
}

if (!customElements.get("page-area"))
  customElements.define("page-area", PageArea);
