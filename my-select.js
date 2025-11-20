const currentScript = document.currentScript;
if (!currentScript) {
    throw new Error('Unable to identify current script for the component registration.');
}

const componentName = currentScript.dataset.name;
if (!componentName) {
    throw new Error('Component name must be provided via data-name attribute on the script element.');
}

class MySelect extends HTMLElement {
    #selectButton;
    #selectPopup;
    #selectPopupSearch;
    #optionsBox;
    #options = [];
    #initialized = false;

    connectedCallback() {
        if (this.#initialized) {
            return;
        }

        this.#options = this.#extractOptions();
        this.#createTemplate();

        const renderedOptions = this.#renderOptions(this.#options);
        this.#optionsBox.replaceWith(renderedOptions);
        this.#optionsBox = renderedOptions;

        this.#selectButton.textContent = this.getAttribute('label') ?? 'Select options';

        this.#initialized = true;
    }

    disconnectedCallback() {

    }

    #extractOptions() {
        const optionElements = Array.from(this.querySelectorAll('option'));

        const options = optionElements.map((option) => {
            const value = option.value.trim() || option.textContent.trim();
            const label = option.textContent.trim();

            return { value, label };
        });

        optionElements.forEach((option) => option.remove());

        return options;
    }

    #createTemplate() {
        if (this.childNodes.length > 0) {
            this.innerHTML = '';
        }

        const template = document.createElement('template');
        template.innerHTML = `
            <style>
            
                my-select {
                    position: relative;
                    display: inline-block;
                }
                .select-popup{
                    display: none;
                    position: absolute;
                    top: 100%;
                    left: 0;
                }
                
                .select-popup.open{
                    display: block;
                }
            </style>
            <button class="select-button" type="button"></button>
            <div class="select-popup">
                <input class="select-popup-search" type="search" placeholder="Search..." />
                <div class="select-popup-options"></div>
            </div>
        `;

        this.append(template.content.cloneNode(true));

        this.#selectButton = this.querySelector('.select-button');
        this.#selectPopup = this.querySelector('.select-popup');
        this.#selectPopupSearch = this.querySelector('.select-popup-search');
        this.#optionsBox = this.querySelector('.select-popup-options');
    }

    #renderOptions(options) {
        const containerTemplate = document.createElement('template');
        containerTemplate.innerHTML = '<div class="select-popup-options"></div>';
        const optionsContainer = containerTemplate.content.cloneNode(true).firstElementChild;

        const optionTemplate = document.createElement('template');
        optionTemplate.innerHTML = `
            <label class="option">
                <input type="checkbox" />
            </label>
        `;

        options.forEach(({ value, label }) => {
            const optionFragment = optionTemplate.content.cloneNode(true);
            const optionLabel = optionFragment.querySelector('label.option');
            const checkbox = optionFragment.querySelector('input[type="checkbox"]');

            optionLabel.dataset.value = value;
            checkbox.value = value;
            optionLabel.append(document.createTextNode(label));

            optionsContainer.append(optionFragment);
        });

        return optionsContainer;
    }

    #openPopup() {
      this.#selectPopup.classList.toggle("open");
    }
}

if (customElements.get(componentName)) {
    console.warn(`Custom element "${componentName}" is already registered.`);
} else {
    customElements.define(componentName, MySelect);
}
