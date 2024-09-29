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

const SITE_FOOTER_TAG = "site-footer";

if (!customElements.get(SITE_FOOTER_TAG))
  customElements.define(SITE_FOOTER_TAG, Footer);
