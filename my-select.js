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
    #shadow;
    #selected = new Set();
    #listeners;

    get value() {
        return this.#options.filter(option => this.#selected.has(option.value))
            .map(option => option.value).join(',');
    }

    connectedCallback() {
        if (this.#initialized) {
            this.#listen();
            return;
        }

        this.#shadow = this.attachShadow({ mode: 'open' });
        this.#options = this.#extractOptions();
        this.#createTemplate();

        const renderedOptions = this.#renderOptions(this.#options);
        this.#optionsBox.replaceWith(renderedOptions);
        this.#optionsBox = renderedOptions;

        this.#selectButton.textContent = this.getAttribute('label') ?? 'Select options';
        this.#listen();

        this.#initialized = true;
    }

    disconnectedCallback() {
        this.#listeners.abort();
        this.#selectPopup.classList.remove('open');
    }

    #listen() {
        this.#listeners?.abort();
        this.#listeners = new AbortController();
        const settings = { signal: this.#listeners.signal };
        this.#selectButton.addEventListener('click', () => this.#openPopup(), settings);
        this.#selectPopupSearch.addEventListener('input', () => {
            const query = this.#selectPopupSearch.value.trim().toLocaleLowerCase();
            const options = this.#options.filter(option => option.label.toLocaleLowerCase().includes(query));
            const renderedOptions = this.#renderOptions(options);
            this.#optionsBox.replaceWith(renderedOptions);
            this.#optionsBox = renderedOptions;
        }, settings);
        this.#selectPopup.addEventListener('change', event => {
            const checkbox = event.target;
            if (!checkbox.matches('input[type="checkbox"]')) return;
            if (checkbox.checked) this.#selected.add(checkbox.value);
            else this.#selected.delete(checkbox.value);
            this.#selectButton.textContent = this.#options
                .filter(option => this.#selected.has(option.value))
                .map(option => option.label).join(', ') || this.getAttribute('label') || 'Select options';
            this.dispatchEvent(new Event('change', { bubbles: true }));
        }, settings);
        this.ownerDocument.addEventListener('click', event => {
            if (!event.composedPath().includes(this)) this.#selectPopup.classList.remove('open');
        }, settings);
        this.#shadow.addEventListener('keydown', event => {
            if (event.key === 'Escape') {
                this.#selectPopup.classList.remove('open');
                this.#selectButton.focus();
            }
        }, settings);
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
            
                :host {
                    position: relative;
                    display: inline-block;
                    width: 280px;
                    font: 15px system-ui, sans-serif;
                    color: #334155;
                }
                * { box-sizing: border-box; }
                .select-button {
                    width: 100%;
                    padding: 12px 16px;
                    text-align: left;
                    font: inherit;
                    color: inherit;
                    background: var(--select-background, white);
                    border: 1px solid #cbd5e1;
                    border-radius: 8px;
                    cursor: pointer;
                }
                .select-button::after { content: '▾'; float: right; }
                .select-button:hover { border-color: #6366f1; }
                .select-button:focus-visible,
                .select-popup-search:focus-visible {
                    outline: 2px solid #6366f1;
                    outline-offset: 2px;
                }
                .select-popup{
                    display: none;
                    position: absolute;
                    top: 100%;
                    left: 0;
                    width: 100%;
                    margin-top: 6px;
                    padding: 8px;
                    background: var(--select-popup-background, white);
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    box-shadow: 0 8px 24px #0f172a26;
                    z-index: 1;
                }
                .select-popup-search {
                    width: 100%;
                    padding: 9px 12px;
                    margin-bottom: 6px;
                    font: inherit;
                    border: 1px solid #cbd5e1;
                    border-radius: 6px;
                }
                .select-popup-options { max-height: 240px; overflow-y: auto; }
                .option {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 10px;
                    border-radius: 6px;
                    cursor: pointer;
                }
                .option:hover { background: #f1f5f9; }
                .option:has(input:checked) { background: #eef2ff; color: #4338ca; }
                .option input { accent-color: #6366f1; width: 16px; height: 16px; }
                
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

        this.#shadow.append(template.content.cloneNode(true));

        this.#selectButton = this.#shadow.querySelector('.select-button');
        this.#selectPopup = this.#shadow.querySelector('.select-popup');
        this.#selectPopupSearch = this.#shadow.querySelector('.select-popup-search');
        this.#optionsBox = this.#shadow.querySelector('.select-popup-options');
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
            checkbox.checked = this.#selected.has(value);
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
