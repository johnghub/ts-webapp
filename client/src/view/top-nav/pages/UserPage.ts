import { IConnectedCallback } from "../../../main";
import { IRenderable } from "../../../main";

export default class UserPage
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
    const page = document.createElement("userpage");
    if (this.isAuthenticated) {
      page.innerHTML = `
            <style>
                .about-page-style {
                    display: block;
                    padding: 16px;
                    background-color: #808080;  // Light grey background
                    color: black;  // Black text
                    font-size: 24px;  // Larger text for visibility
                }
            </style>
            <div">This is the User page</div>`;
      return page;
    }
    page.innerHTML = `
            <style>
                .about-page-style {
                    display: block;
                    padding: 16px;
                    background-color: #AA0000;  // Light grey background
                    color: white;  // Black text
                    font-size: 24px;  // Larger text for visibility
                }
            </style>
            <div">Not authenticated for the User page</div>`;
    return page;
  }

  get isAuthenticated(): boolean {
    return true;
  }
}
// Define the custom element
if (!customElements.get("user-page"))
  customElements.define("user-page", UserPage);
