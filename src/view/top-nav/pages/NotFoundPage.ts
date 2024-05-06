import { IRenderable } from "../../main";
import { IConnectedCallback } from "../../main";

export default class NotFoundPage
  extends HTMLElement
  implements IConnectedCallback, IRenderable
{
  constructor() {
    super();
  }

  connectedCallback() {
    // Append rendered content directly to this component
    this.render();
  }

  render(): HTMLElement {
    {
      const page = document.createElement("nfpage");
      this.innerHTML = `
            <style>
                .nfpage {
                    display: block;
                    padding: 16px;
                    background-color: #f0f0f0;  // Light grey background
                    color: black;  // Black text
                    font-size: 24px;  // Larger text for visibility
                }
            </style>
            <div class="nfpage"><h1>404 Not Found</h1><p>The page you are looking for does not exist.</p></div>
        `;
      return page;
    }
  }
}

// Define the custom element
if (!customElements.get("nf-page"))
  customElements.define("nf-page", NotFoundPage);
