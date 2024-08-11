import { ServiceBase } from "./ServiceBase";

export class ServiceRegistry extends HTMLElement {
  static getService<T extends ServiceBase>(serviceClass: {
    new (): T;
    tagName: string;
  }): T | null {
    try {
      const tagName = serviceClass.tagName;
      return document.querySelector(tagName) as T;
    } catch (error) {
      console.error("Failed to retrieve service:", error);
      return null;
    }
  }
}

const SERVICE_REGISTRY_TAG = "service-registry";

if (!customElements.get(SERVICE_REGISTRY_TAG))
  customElements.define(SERVICE_REGISTRY_TAG, ServiceRegistry);
