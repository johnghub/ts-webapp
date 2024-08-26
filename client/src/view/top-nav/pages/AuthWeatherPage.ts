import { AUTH_STATE_SERVICE_TAG } from "../../../common";
import { IConnectedCallback } from "../../main";
import { IRenderable } from "../../main";

export default class AuthWeatherPage
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
    const page = document.createElement("authweatherpage");

    const isAuthenticated = (
      document.querySelector(AUTH_STATE_SERVICE_TAG) as any
    ).isAuthenticated();

    if (isAuthenticated) {
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
            <div">Not authenticated for the auth weather page</div>`;
    return page;
  }
}

const AUTHWEATHER_PAGE_TAG = "authweather-page";
// Define the custom element
if (!customElements.get(AUTHWEATHER_PAGE_TAG))
  customElements.define(AUTHWEATHER_PAGE_TAG, AuthWeatherPage);
