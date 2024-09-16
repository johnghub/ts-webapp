export class WeatherPageFilterDialog extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.render();
    const closeBtn = this.querySelector("#closeBtn");
    const applyBtn = this.querySelector("#applyBtn");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => this.hide());
    }
    if (applyBtn) {
      applyBtn.addEventListener("click", () => this.applyFilter());
    }
  }

  disconnectedCallback() {
    const closeBtn = this.querySelector("#closeBtn");
    const applyBtn = this.querySelector("#applyBtn");
    if (closeBtn) {
      closeBtn.removeEventListener("click", () => this.hide());
    }
    if (applyBtn) {
      applyBtn.removeEventListener("click", () => this.applyFilter());
    }
  }

  render() {
    this.innerHTML = `
            <div class="modal">
                <div class="modal-content">
                    <span class="close-button">&times;</span>
                    <h2>Filter Weather Data</h2>
                    <input id="filterInput" type="text" placeholder="Enter filter value">
                    <select id="filterType">
                        <option value="summary">Summary</option>
                        <option value="temperatureC">Temperature (°C)</option>
                        <option value="temperatureF">Temperature (°F)</option>
                        <option value="date">Date</option>
                    </select>
                    <button id="applyBtn">Apply Filter</button>
                    <button id="closeBtn">Close</button>
                </div>
            </div>
        `;

    this.querySelector(".close-button")!.addEventListener("click", () =>
      this.hide()
    );
  }

  show(): void {
    this.style.display = "flex";
    const modal = this.querySelector(".modal") as HTMLElement;
    if (modal) {
      modal.style.display = "flex";
    } else {
      console.log("Filter modal is null");
    }
    this.style.display = "block"; // Make sure this controls the visibility appropriately
  }

  hide = (): void => {
    this.style.display = "none";
  };

  applyFilter() {
    const filterInput = this.querySelector("#filterInput") as HTMLInputElement;

    const filterType = this.querySelector("#filterType") as HTMLInputElement;

    this.dispatchEvent(
      new CustomEvent("apply-filter", {
        detail: {
          filterType: filterType.value,
          filterInput: filterInput.value,
        },
        bubbles: true,
        composed: false, // event does not need to bubble out of a shadow DOM
      })
    );
    this.hide();
  }
}

const FILTER_MODAL_TAG = "filter-modal";
if (!customElements.get(FILTER_MODAL_TAG)) {
  customElements.define(FILTER_MODAL_TAG, WeatherPageFilterDialog);
}
