// Importing this way forces load of components
import "./NavBar";
import "./PageArea";
import "./Footer";
import "./services/AuthStateService";
import "./services/network/AuthProxyService";

// Optionally export them if they need to be used elsewhere
export { NavBar } from "./NavBar";
export { PageArea } from "./PageArea";
export { Footer } from "./Footer";
export { AuthStateService } from "./services/AuthStateService";
export { AuthProxyService } from "./services/network/AuthProxyService";
export { weatherDataManager } from "./services/StateManagerService";
