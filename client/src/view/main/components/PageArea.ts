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

const PAGE_AREA_TAG = "page-area";

if (!customElements.get(PAGE_AREA_TAG))
  customElements.define(PAGE_AREA_TAG, PageArea);
