import { IConnectedCallback } from "../../../main/";
import { IRenderable } from "../../../main/";

export default class SkiingPage
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
    const page = document.createElement("skiingpage");
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
            <div">This is the Skiing page</div>
        `;
    return page;
  }
}

// Define the custom element
if (!customElements.get("skiing-page"))
  customElements.define("skiing-page", SkiingPage);
