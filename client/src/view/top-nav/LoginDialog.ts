export enum AuthMethod {
  Password = "password",
  Email = "email",
  OAuth = "oauth",
  Certificate = "certificate",
}

export class LoginDialog extends HTMLElement {
  private method: AuthMethod;

  static get observedAttributes() {
    return ["method"];
  }

  constructor() {
    super();
    this.method = AuthMethod.Password; // Default method
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (name === "method" && oldValue !== newValue) {
      this.method = newValue as AuthMethod;
      this.render();
    }
  }

  show() {
    this.style.display = "flex"; // Make sure this controls the visibility appropriately

    const modal = this.querySelector(".modal") as HTMLElement | null;
    if (modal) {
      modal.style.display = "flex"; // Show the modal
    } else {
      console.error("The modal element does not exist!");
    }

    this.style.display = "block"; // Make sure this controls the visibility appropriately
  }

  hide() {
    this.style.display = "none";
  }

  displayError(message: string) {
    const errorMessage = this.querySelector(".error-message") as HTMLElement;
    errorMessage!.textContent = message;
    errorMessage!.style.visibility = "visible";
  }

  clearError() {
    const errorMessage = this.querySelector(".error-message") as HTMLElement;
    errorMessage!.textContent = "";
    errorMessage!.style.visibility = "hidden";
  }

  render() {
    this.innerHTML = `
    <div class="modal">
        <div class="modal-content">
            <span class="close-button">&times;</span>
            <form id="loginForm" class="login-form">
                <!-- Form content will be dynamically added here -->
            </form>
            <div class="error-message" aria-live="assertive"></div>
            </div>
    </div>
`;
    const form = this.querySelector("form");
    this.appendFormContent(form!);
    this.querySelector(".close-button")!.addEventListener("click", () =>
      this.hide()
    );
  }

  appendFormContent(form: HTMLFormElement) {
    switch (this.method) {
      case AuthMethod.Password:
        this.appendPasswordField(form);
        break;
      case AuthMethod.Email:
        this.appendEmailField(form);
        break;
      case AuthMethod.OAuth:
        this.appendOAuthButton(form);
        break;
      case AuthMethod.Certificate:
        this.appendCertificateButton(form);
        break;
      default:
        console.error(`Unsupported authentication method: ${this.method}`);
        return;
    }

    const submitButton = document.createElement("button");
    submitButton.type = "submit";
    submitButton.textContent = "Login";
    form.appendChild(submitButton);

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      this.handleSubmit(event);
    });
  }

  // #region auth methods
  appendPasswordField(form: HTMLFormElement) {
    const usernameGroup = document.createElement("div");
    usernameGroup.className = "input-group";
    usernameGroup.innerHTML = `<label for="username">Username:</label><input type="text" id="username" name="username" placeholder="Enter username">`;
    form.appendChild(usernameGroup);

    const passwordGroup = document.createElement("div");
    passwordGroup.className = "input-group";
    passwordGroup.innerHTML = `<label for="password">Password:</label><input type="password" id="password" name="password" placeholder="Enter password">`;
    form.appendChild(passwordGroup);
  }

  appendEmailField(form: HTMLFormElement) {
    const emailGroup = document.createElement("div");
    emailGroup.className = "input-group";
    emailGroup.innerHTML = `<label for="email">Email Address:</label><input type="email" id="email" name="email" placeholder="Email Address">`;
    form.appendChild(emailGroup);
  }

  appendOAuthButton(form: HTMLFormElement) {
    const oauthButton = document.createElement("button");
    oauthButton.type = "button";
    oauthButton.textContent = "Sign in with OAuth";
    oauthButton.onclick = () => (window.location.href = "/oauth-login"); // Redirect to OAuth login URL
    const oauthGroup = document.createElement("div");
    oauthGroup.className = "button-group";
    oauthGroup.appendChild(oauthButton);
    form.appendChild(oauthGroup);
  }

  appendCertificateButton(form: HTMLFormElement) {
    const certButton = document.createElement("button");
    certButton.type = "button";
    certButton.textContent = "Use Client Certificate";
    certButton.onclick = () => {
      // Trigger client certificate request
      alert(
        "Client certificate authentication is not fully supported in all browsers."
      );
    };
    form.appendChild(certButton);
  }
  // #endregion

  handleSubmit(event: Event) {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    const jsonData = Object.fromEntries(formData.entries());

    console.log("Form Data:", jsonData); // Log or use JSON data as needed

    this.clearError();

    const mockSuccess: boolean = true;
    if (mockSuccess)
      // Mocking a successful login response
      setTimeout(() => {
        // Simulate network delay
        const mockResponse = {
          success: true,
          message: "Login successful",
          user: { name: "Test User" },
        };
        console.log("Success:", mockResponse);
        this.dispatchEvent(
          new CustomEvent("login-success", {
            detail: mockResponse,
            bubbles: true,
            composed: true,
          })
        );
        this.hide(); // Hide the dialog on successful login
      }, 1000);
    //If you want to simulate an error
    else
      setTimeout(() => {
        const errorResponse = { success: false, message: "Login failed" };
        console.error("Error:", errorResponse);
        // Handle error here, e.g., display a message to the user
        if (!errorResponse.success) {
          // If the login failed, display the error message
          this.displayError(errorResponse.message);
        }
      }, 1000);

    // fetch("/login", {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify(jsonData),
    // })
    //   .then((response) => response.json())
    //   .then((data) => {
    //     console.log("Success:", data);
    //     this.dispatchEvent(new CustomEvent("auth-change", { detail: data }));
    //   })
    //   .catch((error) => {
    //     console.error("Error:", error);
    //   });

    // this.hide();
  }
}

if (!customElements.get("login-dialog")) {
  customElements.define("login-dialog", LoginDialog);
}
