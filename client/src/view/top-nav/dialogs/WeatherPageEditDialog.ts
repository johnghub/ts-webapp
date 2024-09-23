import { WEATHER_EDIT_MODAL_TAG } from "../../../common";
import { weatherDataManager } from "../../main/components";

export class WeatherPageEditDialog extends HTMLElement {
  private form: HTMLFormElement;
  private cancelBtn: HTMLButtonElement;
  private isAdding: boolean = true; // True if adding, false if editing

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

    this.form = this.querySelector("form")!; // Ensure this selector matches your form
    if (this.form) {
      this.form.addEventListener("submit", (e) => this.submitForm(e)); // Attach the submitForm method
    }

    this.querySelector<HTMLInputElement>("#temperatureC")?.addEventListener(
      "input",
      this.convertToFahrenheit
    );
    this.querySelector<HTMLInputElement>("#temperatureF")?.addEventListener(
      "input",
      this.convertToCelsius
    );
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

    this.querySelector<HTMLInputElement>("#temperatureC")?.removeEventListener(
      "input",
      this.convertToFahrenheit
    );
    this.querySelector<HTMLInputElement>("#temperatureF")?.removeEventListener(
      "input",
      this.convertToCelsius
    );
  }

  // Arrow function to automatically bind `this`
  convertToFahrenheit = () => {
    const celsiusInput = this.querySelector<HTMLInputElement>("#temperatureC");
    const fahrenheitInput =
      this.querySelector<HTMLInputElement>("#temperatureF");

    // Assuming inputs are always present, no need to check for their existence
    const celsius = celsiusInput!.valueAsNumber;

    if (!isNaN(celsius)) {
      // Only check if the input is a valid number
      const fahrenheit = (celsius * 9) / 5 + 32;
      fahrenheitInput!.value = Math.round(fahrenheit).toString();
    } else {
      fahrenheitInput!.value = ""; // Clear if the input is not a valid number
    }
  };

  // Arrow function to automatically bind `this`
  convertToCelsius = () => {
    const fahrenheitInput =
      this.querySelector<HTMLInputElement>("#temperatureF");
    const celsiusInput = this.querySelector<HTMLInputElement>("#temperatureC");

    const fahrenheit = fahrenheitInput!.valueAsNumber;

    if (!isNaN(fahrenheit)) {
      // Only check if the input is a valid number
      const celsius = ((fahrenheit - 32) * 5) / 9;
      celsiusInput!.value = Math.round(celsius).toString();
    } else {
      celsiusInput!.value = ""; // Clear if the input is not a valid number
    }
  };

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
                    padding: 8px 16px;
                    font-size: 14px;
                    cursor: pointer;
                    background-color: #f9f9f9; /* Default light background for all buttons */
                    border: 1px solid #ccc; /* Default border color */
                    color: #333; /* Default text color */
                }
                .button-group {
                    display: flex;
                    justify-content: space-between; /* Aligns buttons to the right; use 'space-between' if needed */
                    gap: 10px; /* Ensures there is space between buttons */
                    padding-top: 20px; /* Provides some spacing from the form */
                }
                    #cancelBtn {
                    background-color: silver; /* Specific style for the Cancel button */
                    color: black; /* Ensures text visibility on silver background */
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
                        <input type="number" id="temperatureC" name="temperatureC" >
                    </div>
                    <div class="form-group">
                        <label for="temperatureF">Temperature (°F):</label>
                        <input type="number" id="temperatureF" name="temperatureF" >
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
                </form>
                <div class="button-group">
                    <button id="addSaveBtn" type="submit" form="dataForm">Add</button>
                    <button id="cancelBtn">Cancel</button>
                </div>
                </div>
            </div>
        `;

    this.querySelector(".close-button")!.addEventListener("click", () =>
      this.hide()
    );

    this.form = this.querySelector<HTMLFormElement>("#dataForm")!;
  }

  show(addData: boolean = false, id?: number) {
    this.isAdding = addData;
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

    if (id) {
      weatherDataManager.setCurrentId(id);
    }

    if (!this.isAdding && id) {
      const data = weatherDataManager.getDataById(id);
      this.populateForm(data);
    }
  }

  hide() {
    this.style.display = "none"; // Hide the entire dialog
  }

  populateForm(data: any) {
    this.querySelector("#date")!.value = data.date;
    this.querySelector("#temperatureC")!.value = data.temperatureC;
    this.querySelector("#temperatureF")!.value = data.temperatureF;
    this.querySelector("#summary")!.value = data.summary;
    // Assume other form fields are set here
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
    if (!this.isAdding) {
      data.id = weatherDataManager.getCurrentId(); // Get the id for the edit operation
      weatherDataManager.updateData(data);
    } else {
      weatherDataManager.addData(data);
    }

    this.hide();
  }
}

if (!customElements.get(WEATHER_EDIT_MODAL_TAG)) {
  customElements.define(WEATHER_EDIT_MODAL_TAG, WeatherPageEditDialog);
}
