// Assuming the interfaces are in the same directory or correctly referenced
import { IRenderable } from "../../main/Interfaces/IRenderable";
import { ILifecycleCallbacks } from "../../main/Interfaces/ILifecycleCallbacks";

export default class BarGraphPage
  extends HTMLElement
  implements IRenderable, ILifecycleCallbacks
{
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  private data: number[] = [5, 10, 15, 10, 5];
  private connection: signalR.HubConnection;

  constructor() {
    super();
    this.canvas = document.createElement("canvas");
    this.context = this.canvas.getContext("2d")!;
    this.setupSignalR();
  }

  connectedCallback(): void {
    if (document.readyState === "complete") {
      this.resizeCanvas();
    } else {
      window.addEventListener("load", () => this.resizeCanvas(), {
        once: true,
      });
    }
    this.appendChild(this.updateData([])); // Example initial data
  }

  disconnectedCallback(): void {
    window.removeEventListener("resize", this.resizeCanvas);
    this.connection.stop();
  }

  private resizeCanvas = (): void => {
    requestAnimationFrame(() => {
      this.canvas.width = this.clientWidth; // Use clientWidth/clientHeight instead of offsetWidth/offsetHeight
      this.style.height = `${window.innerHeight * 0.85}px`;
      this.canvas.height = this.clientHeight;
      this.drawBarGraph(this.data); // Redraw the graph with new dimensions
    });
  };

  async setupSignalR(): Promise<void> {
    // Build and start the SignalR connection
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl("https://localhost:7129/graphhub") // Adjust this URL to your SignalR Hub endpoint
      .configureLogging(signalR.LogLevel.Debug)
      .build();

    this.connection.on("ReceiveGraphData", (data: number[]) => {
      this.updateData(data);
    });

    try {
      await this.connection.start();
      console.log("SignalR Connected.");
    } catch (err) {
      console.error("SignalR Connection Error: ", err);
    }
  }

  public render(): HTMLElement {
    return this.canvas; // Here render returns the canvas as an HTMLElement
  }

  public drawBarGraph(data: number[]): void {
    const width = this.canvas.width;
    const height = this.canvas.height;
    const barWidth = width / data.length;

    this.context.clearRect(0, 0, width, height); // Clear the canvas
    this.context.fillStyle = "#00ff00"; // Bar color

    data.forEach((value, index) => {
      const barHeight = value * (height / 20); // Scale bar height to canvas height
      this.context.fillRect(
        index * barWidth,
        height - barHeight,
        barWidth - 2,
        barHeight
      );
    });
  }

  public updateData(newData: number[]): HTMLElement {
    this.drawBarGraph(newData);
    return this.render(); // Optionally re-render or update the canvas
  }
}

const BARGRAPH_ELEMENT_TAG = "bargraph-page";
// Define the custom element
if (!customElements.get(BARGRAPH_ELEMENT_TAG))
  customElements.define(BARGRAPH_ELEMENT_TAG, BarGraphPage);
