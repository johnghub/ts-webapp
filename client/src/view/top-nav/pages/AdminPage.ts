import { IConnectedCallback } from "../../main";
import { IRenderable } from "../../main";

export default class AdminPage
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
    const page = document.createElement("adminpage");
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
            <div">This is the Admin page</div>`;
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
            <div">Not authenticated for the Admin page</div>`;
    return page;
  }

  get isAuthenticated(): boolean {
    return false;
  }
}
// Define the custom element
if (!customElements.get("admin-page"))
  customElements.define("admin-page", AdminPage);
