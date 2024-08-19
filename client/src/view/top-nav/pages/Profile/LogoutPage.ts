import { IConnectedCallback } from "../../../main/";
import { IRenderable } from "../../../main/";

export class LogoutPage
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
    const page = document.createElement("logoutpage");
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
            <div">This is the logout page</div>
        `;
    return page;
  }
}

const LOGOUT_ELEMENT_TAG = "logout-page";

// Define the custom element
if (!customElements.get(LOGOUT_ELEMENT_TAG))
  customElements.define(LOGOUT_ELEMENT_TAG, LogoutPage);
