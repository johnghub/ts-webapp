import { AuthStateService } from "./AuthStateService";
import { ServiceBase } from "./ServiceBase";

const AUTH_VIEW_SERVICE_TAG = "auth-view-service";

export class AuthViewService extends ServiceBase {
  // private authService?: AuthStateService;
  // connectedCallback(): void {
  //   // Assume the parent auth-container initializes and holds the AuthService
  //   this.authService = this.closest("auth-container")?.authService;
  //   if (this.authService) {
  //     this.authService.onAuthChange(this.updateVisibility.bind(this));
  //     this.updateVisibility(this.authService.isAuthenticated());
  //   } else {
  //     console.error("AuthService not found in auth-container");
  //   }
  // }
  // updateVisibility(isAuthenticated: boolean): void {
  //   const authElements = document.querySelectorAll(
  //     '[data-visible-auth="authenticated"]'
  //   );
  //   const anonElements = document.querySelectorAll(
  //     '[data-visible-auth="anonymous"]'
  //   );
  //   authElements.forEach((elem) => {
  //     elem.classList.toggle("hidden", !isAuthenticated);
  //   });
  //   anonElements.forEach((elem) => {
  //     elem.classList.toggle("hidden", isAuthenticated);
  //   });
  // }
}
if (!customElements.get(AUTH_VIEW_SERVICE_TAG))
  customElements.define(AUTH_VIEW_SERVICE_TAG, AuthViewService);
