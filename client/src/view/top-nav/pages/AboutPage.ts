import { IConnectedCallback } from "../../main/";
import { IRenderable } from "../../main/";

export default class AboutPage
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
    const page = document.createElement("aboutpage");
    page.innerHTML = `
            <style>
                .about-page-style {
                    display: block;
                    padding: 16px;
                    background-color: #f0f0f0;  // Light grey background
                    color: black;  // Black text
                    font-size: 24px;  // Larger text for visibility
                }
            </style>
            <div">This is the About page</div>
        `;
    return page;
  }
}

// Define the custom element
if (!customElements.get("about-page"))
  customElements.define("about-page", AboutPage);
