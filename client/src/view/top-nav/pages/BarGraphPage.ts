// Assuming the interfaces are in the same directory or correctly referenced
import { IRenderable } from "../../main/Interfaces/IRenderable";
import { ILifecycleCallbacks } from "../../main/Interfaces/ILifecycleCallbacks";
import { appConfig } from "../../../appconfig";

export default class BarGraphPage
  extends HTMLElement
  implements IRenderable, ILifecycleCallbacks
{
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  private data: number[] = [5, 10, 15, 10, 5];
  private connection: signalR.HubConnection;
  private maxOffset = 15; // Max pixel offset for the center

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
      .withUrl(`${appConfig.domain}/graphhub`) // Adjust this URL to your SignalR Hub endpoint
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

  drawLine(lineData: any) {
    const offsetX =
      Math.floor(Math.random() * (2 * this.maxOffset + 1)) - this.maxOffset;
    const offsetY =
      Math.floor(Math.random() * (2 * this.maxOffset + 1)) - this.maxOffset;
    const centerX = this.canvas.width / 2 + offsetX;
    const centerY = this.canvas.height / 2 + offsetY;
    const endX = centerX + lineData.length * Math.cos(lineData.angle);
    const endY = centerY + lineData.length * Math.sin(lineData.angle);

    this.context.beginPath();
    this.context.moveTo(centerX, centerY);
    this.context.lineTo(endX, endY);
    this.context.strokeStyle = lineData.color;
    this.context.stroke();
  }

  public drawBarGraph(data: any): void {
    const width = this.canvas.width;
    const height = this.canvas.height;
    const barWidth = width / data.length;

    this.context.clearRect(0, 0, width, height); // Clear the canvas

    data.forEach((bar: any, index: number) => {
      const barHeight = bar.value * (height / 20); // Scale bar height to canvas height
      //console.log(`Bar height: ${bar.value}, color: ${bar.color}`);

      // const gradient = this.context.createLinearGradient(
      //   index * barWidth,
      //   height - barHeight,
      //   index * barWidth,
      //   height
      // );

      // gradient.addColorStop(0, bar.startColor);
      // gradient.addColorStop(1, bar.endColor);

      //this.context.fillStyle = gradient;
      this.context.fillStyle = bar.color; // Use the color from the data

      this.context.fillRect(
        index * barWidth,
        height - barHeight,
        barWidth - 2,
        barHeight
      );
    });
  }

  //public updateData(newData: number[]): HTMLElement {
  public updateData(newData: any): HTMLElement {
    //this.drawBarGraph(newData);
    this.drawLine(newData);
    return this.render(); // Optionally re-render or update the canvas
  }
}

const BARGRAPH_ELEMENT_TAG = "bargraph-page";
// Define the custom element
if (!customElements.get(BARGRAPH_ELEMENT_TAG))
  customElements.define(BARGRAPH_ELEMENT_TAG, BarGraphPage);
