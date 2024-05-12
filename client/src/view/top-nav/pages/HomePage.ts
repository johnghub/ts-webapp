import { IConnectedCallback } from "../../main";
import { IRenderable } from "../../main";

export default class HomePage
  extends HTMLElement
  implements IRenderable, IConnectedCallback
{
  constructor() {
    super();
  }

  connectedCallback(): void {
    // Append rendered content directly to this component
    this.appendChild(this.render());
  }

  render(): HTMLElement {
    const page = document.createElement("homepage");
    page.innerHTML = `
            <style>
                .home-page {
                    display: block;
                    padding: 16px;
                    background-color: #f0f0f0;  // Light grey background
                    color: black;  // Black text
                    font-size: 24px;  // Larger text for visibility
                }
            </style>
            <div class="home-page">This is the home page</div>
        `;
    return page;
  }
}

// Define the custom element
if (!customElements.get("home-page"))
  customElements.define("home-page", HomePage);
