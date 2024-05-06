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
    this.appendChild(this.render());
  }

  render(): HTMLElement {
    const notFound = document.createElement("homepage");
    notFound.innerHTML = `
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
    return notFound;
  }
}

// Define the custom element
if (!customElements.get("home-page"))
  customElements.define("home-page", HomePage);
