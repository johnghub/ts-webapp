import { IConnectedCallback } from "../../main";
import { IRenderable } from "../../main";

export default class ContactPage
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
    const page = document.createElement("contactpage");
    page.innerHTML = `
            <style>
                .contact-page {
                    display: block;
                    padding: 16px;
                    background-color: #f0f0f0;  // Light grey background
                    color: black;  // Black text
                    font-size: 24px;  // Larger text for visibility
                }
            </style>
            <div class="contact-page">This is the Contact page</div>
        `;
    return page;
  }
}

// Define the custom element
if (!customElements.get("contact-page"))
  customElements.define("contact-page", ContactPage);
