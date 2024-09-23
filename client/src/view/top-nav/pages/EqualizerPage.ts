// Assuming the interfaces are in the same directory or correctly referenced
import { IRenderable } from "../../main/Interfaces/IRenderable";
import { ILifecycleCallbacks } from "../../main/Interfaces/ILifecycleCallbacks";

export default class EqualizerPage
  extends HTMLElement
  implements IRenderable, ILifecycleCallbacks
{
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  private data: number[] = [5, 10, 15, 10, 5];

  constructor() {
    super();
    this.canvas = document.createElement("canvas");
    this.context = this.canvas.getContext("2d")!;
    //this.initializeCanvas();
    //this.appendChild(this.canvas);
  }

  connectedCallback(): void {
    window.addEventListener("resize", this.initializeCanvas);
    // this.appendChild(this.updateData([5, 10, 15, 10, 5])); // Example initial data
    this.appendChild(this.updateData([5, 10, 15, 10, 5]));
  }

  disconnectedCallback(): void {
    window.removeEventListener("resize", this.initializeCanvas);
  }

  private initializeCanvas = (): void => {
    this.canvas.width = this.offsetWidth;
    this.canvas.height = this.offsetHeight;
    this.drawEqualizer(this.data); // Redraw if there's existing data
  };

  public render(): HTMLElement {
    return this.canvas; // Here render returns the canvas as an HTMLElement
  }

  public drawEqualizer(data: number[]): void {
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
    this.drawEqualizer(newData);
    return this.render(); // Optionally re-render or update the canvas
  }
}

const EQUALIZER_ELEMENT_TAG = "equalizer-page";
// Define the custom element
if (!customElements.get(EQUALIZER_ELEMENT_TAG))
  customElements.define(EQUALIZER_ELEMENT_TAG, EqualizerPage);
