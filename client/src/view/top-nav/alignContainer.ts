import { IConnectedCallback, IRenderable } from "../main";

export class AlignContainer
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
    const alignment: string = this.getAttribute("alignment") || "left";
    const div: HTMLDivElement = document.createElement("div");
    //div.classList.add('menu-items');
    div.classList.add(alignment);

    // Append all child nodes of the custom HTML element to the div
    this.childNodes.forEach((child) => {
      if (child.nodeType === Node.ELEMENT_NODE) {
        div.appendChild(child.cloneNode(true));
      }
    });
    return div;
  }
}

if (!customElements.get("align-container"))
  customElements.define("align-container", AlignContainer);
