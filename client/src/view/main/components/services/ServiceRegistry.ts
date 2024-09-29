// TODO: Delete?
export class ServiceRegistry extends HTMLElement {
  private static services: Map<string, Promise<any>> = new Map();

  static getService<T>(
    key: string,
    tagName?: string,
    creator?: () => T
  ): Promise<T> {
    // Check if the service has already been registered
    if (!this.services.has(key)) {
      let servicePromise: Promise<T>;

      if (tagName) {
        // Attempt to find and use a declaratively created instance
        servicePromise = new Promise<T>((resolve, reject) => {
          customElements.whenDefined(tagName).then(() => {
            const element = document.querySelector(tagName) as unknown as T;
            if (element) {
              resolve(element);
            } else {
              reject(new Error(`No element found with tag name ${tagName}`));
            }
          });
        });
      } else if (creator) {
        // Use the provided creator function to instantiate the service
        servicePromise = new Promise<T>((resolve, reject) => {
          try {
            const service = creator();
            resolve(service);
          } catch (error) {
            reject(error);
          }
        });
      } else {
        throw new Error("Either tagName or creator function must be provided.");
      }

      // Store the created service promise
      this.services.set(key, servicePromise);
    }

    // Return the service promise
    return this.services.get(key) as Promise<T>;
  }
}

const SERVICE_REGISTRY_TAG = "service-registry";

if (!customElements.get(SERVICE_REGISTRY_TAG))
  customElements.define(SERVICE_REGISTRY_TAG, ServiceRegistry);

/*
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
*/
