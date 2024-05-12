// components/ErrorPage.ts
export class ErrorPage extends HTMLElement {
  private _message: string = "An unexpected error occurred.";

  constructor() {
    super();
  }

  set message(msg: string) {
    this._message = msg;
    this.render();
  }

  get message(): string {
    return this._message;
  }

  render() {
    const errorPage = document.createElement("errorpage");

    errorPage.innerHTML = `<style>
        .error-page {
            display: block;
            padding: 16px;
            background-color: #ff0000;  // Red background
            color: white;  // White text
            font-size: 24px;  // Larger text for visibility
        }
        </style>
    <div class="error-page"><h1>Error</h1><p>${this._message}</p></div>`;
    return errorPage;
  }
}

customElements.define("error-page", ErrorPage);
