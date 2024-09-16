import { ADD_WEATHER_DATA_MSG, WEATHER_EDIT_MODAL_TAG } from "../../../common";
import { weatherDataManager } from "../../main/components";

export class WeatherPageEditDialog extends HTMLElement {
  private form: HTMLFormElement;
  private cancelBtn: HTMLButtonElement;

  constructor() {
    super();
  }

  connectedCallback() {
    this.render();
    const closeBtn = this.querySelector("#closeBtn");
    if (closeBtn) {
      //&& applyBtn) {
      closeBtn.addEventListener("click", () => this.hide());
    }
    this.cancelBtn = this.querySelector<HTMLButtonElement>("#cancelBtn")!;
    if (this.cancelBtn) {
      this.cancelBtn.addEventListener("click", () => this.hide());
    }
    this.style.display = "none"; // Initially hidden

    this.form = this.querySelector("form"); // Ensure this selector matches your form
    if (this.form) {
      this.form.addEventListener("submit", (e) => this.submitForm(e)); // Attach the submitForm method
    }
  }

  disconnectedCallback() {
    const closeBtn = this.querySelector("#closeBtn");
    if (closeBtn) {
      closeBtn.removeEventListener("click", () => this.hide());
    }
    this.cancelBtn = this.querySelector<HTMLButtonElement>("#cancelBtn")!;
    if (this.cancelBtn) {
      this.cancelBtn.removeEventListener("click", () => this.hide());
    }

    if (this.form) {
      this.form.removeEventListener("submit", this.submitForm);
    }
  }

  render() {
    this.innerHTML = `
            <style>
                #dataForm {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 2px;
                }
                .form-group {
                    display: flex;
                    flex-direction: column;
                }
                .form-group label {
                    margin-bottom: 5px; /* Space between label and input within the group */
                }
                button[type="submit"], button[type="button"] {
                    margin-top: 20px;
                    padding: 8px 16px;
                    font-size: 14px;
                }
            </style>
            <div class="modal">
                <div class="modal-content">
                <span class="close-button">&times;</span>
                <form id="dataForm">
                    <h2 id="banner"></h2>
                    <div class="form-group">
                        <label for="date">Date:</label>
                        <input type="date" id="date" name="date">
                    </div>
                    <div class="form-group">
                        <label for="temperatureC">Temperature (°C):</label>
                        <input type="number" id="temperatureC" name="temperatureC">
                    </div>
                    <div class="form-group">
                        <label for="temperatureF">Temperature (°F):</label>
                        <input type="number" id="temperatureF" name="temperatureF">
                    </div>
                    <div class="form-group">
                        <label for="summary">Summary:</label>
                        <select id="summary" name="summary">
                            <option value="Balmy">Balmy</option>
                            <option value="Bracing">Bracing</option>
                            <option value="Chilly">Chilly</option>
                            <option value="Cool">Cool</option>
                            <option value="Freezing">Freezing</option>
                            <option value="Hot">Hot</option>
                            <option value="Mild">Mild</option>
                            <option value="Scorching">Scorching</option>
                            <option value="Sweltering">Sweltering</option>
                            <option value="Warm">Warm</option>
                        </select>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <button id="addSaveBtn" type="submit">Add</button>
                    </div>
                </form>
                <button id="cancelBtn">Cancel</button>
                </div>
            </div>
        `;

    this.querySelector(".close-button")!.addEventListener("click", () =>
      this.hide()
    );

    this.form = this.querySelector<HTMLFormElement>("#dataForm")!;
  }

  show(addData = false) {
    const banner = this.querySelector("#banner");
    if (banner) {
      banner.innerHTML = `${addData ? "Add" : "Edit"} weather data`;
    }
    const addSaveBtn = this.querySelector("#addSaveBtn");
    if (addSaveBtn) {
      addSaveBtn.textContent = `${addData ? "Add" : "Save"}`;
    }
    this.style.display = "flex"; // Use flex to center the dialog
    const modalContent = this.querySelector(".modal") as HTMLElement;
    if (modalContent) {
      modalContent.style.display = "flex"; // Ensure the content is also displayed
    } else {
      console.error("Dialog content is null");
    }
  }

  hide() {
    this.style.display = "none"; // Hide the entire dialog
  }

  submitForm(e: Event) {
    e.preventDefault(); // Prevent the form from submitting traditionally
    const formData = new FormData(this.form);
    const data = {
      date: formData.get("date") as string,
      temperatureC: Number(formData.get("temperatureC")),
      temperatureF: Number(formData.get("temperatureF")),
      summary: formData.get("summary") as string,
    };
    console.log("Submitting data:", data);
    weatherDataManager.addData(data);
    // Trigger an event or callback to save data
    //this.dispatchEvent(new CustomEvent(ADD_WEATHER_DATA_MSG, { detail: data }));
    this.hide();
  }
}

if (!customElements.get(WEATHER_EDIT_MODAL_TAG)) {
  customElements.define(WEATHER_EDIT_MODAL_TAG, WeatherPageEditDialog);
}

/*
 <style>
                :host {
                    display: block;
                    position: fixed;
                    top: 20%;
                    left: 50%;
                    transform: translateX(-50%);
                    border: 1px solid #ccc;
                    background: white;
                    padding: 20px;
                    z-index: 1000;
                }
                form {
                    display: flex;
                    flex-direction: column;
                }
                label {
                    margin-top: 10px;
                }
                input, select, button {
                    margin-top: 5px;
                }
            </style>
*/
