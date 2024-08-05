export abstract class ServiceBase extends HTMLElement {
  // Define a static method to be implemented by all derived classes
  static get tagName(): string {
    throw new Error("Method 'tagName' must be implemented.");
  }
}
