import { IConnectedCallback } from "./IConnectedCallback";
import { IDisconnectedCallback } from "./IDisconnectedCallback";

// Define an interface that includes lifecycle callbacks for Web Components
export interface ILifecycleCallbacks
  extends IConnectedCallback,
    IDisconnectedCallback {}
