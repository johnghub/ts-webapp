import { API_PROXY_TAG } from "../../../../../common";

class ApiProxyService extends HTMLElement {
  private baseUrl: string;

  constructor() {
    super();
    this.baseUrl = this.getBaseUrl();
  }

  private getBaseUrl(): string {
    // Determine the base URL programmatically, for example from the window location or environment variable
    return window.location.origin; // Adjust this logic as needed
  }

  // Example of a GET request to fetch a resource by ID
  async getResourceById(resourceId: string): Promise<any> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/resources/${resourceId}`,
        {
          method: "GET",
        }
      );
      if (!response.ok) {
        throw new Error(`Error fetching resource: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error in getResourceById:", error);
      throw error;
    }
  }

  // Example of a PUT request to update a resource
  async updateResource(resourceId: string, updatedData: any): Promise<any> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/resources/${resourceId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedData),
        }
      );
      if (!response.ok) {
        throw new Error(`Error updating resource: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error in updateResource:", error);
      throw error;
    }
  }
}

// Define the custom element
if (!customElements.get(API_PROXY_TAG))
  customElements.define(API_PROXY_TAG, ApiProxyService);

// Usage example
document.addEventListener("DOMContentLoaded", async () => {
  const apiProxy = document.querySelector("api-proxy") as ApiProxyService;

  if (apiProxy) {
    try {
      // Call GET endpoint
      const resource = await apiProxy.getResourceById("123");
      console.log("Fetched resource:", resource);

      // Call PUT endpoint
      const updatedResource = await apiProxy.updateResource("123", {
        name: "Updated Resource",
        value: 42,
      });
      console.log("Updated resource:", updatedResource);
    } catch (error) {
      console.error("An error occurred:", error);
    }
  }
});
