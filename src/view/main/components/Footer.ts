// src/components/Footer.ts
import { IConnectedCallback } from "../";
import { IRenderable } from "../";
import { getCurrentYear } from "../../../common";

export class Footer
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
    const footer = document.createElement("footer");
    footer.textContent = `Copyright © ${getCurrentYear()}`;
    return footer;
  }
}

if (!customElements.get("site-footer"))
  customElements.define("site-footer", Footer);
