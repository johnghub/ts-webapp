import { IConnectedCallback, IRenderable } from "../main";

export class AuthContainer
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
    // Check if the user is authenticated
    const div: HTMLDivElement = document.createElement("div");
    if (this.isAuthenticated()) {
      div.className = "auth-content"; // A class to style authenticated content if needed

      // Append all child nodes of the custom HTML element to the div if authenticated
      this.childNodes.forEach((child) => {
        if (child.nodeType === Node.ELEMENT_NODE) {
          div.appendChild(child.cloneNode(true));
        }
      });
    } else {
      console.log("Authentication required: content hidden");
    }
    return div;
  }

  isAuthenticated(): boolean {
    // Implement authentication check logic here
    // This could involve checking a token or a global auth state
    // For simplicity, this is a placeholder function
    return false; // Replace this with actual authentication logic
  }
}

if (!customElements.get("auth-container"))
  customElements.define("auth-container", AuthContainer);
