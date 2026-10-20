(() => {
    const currentScript = document.currentScript;
    if (!currentScript) {
        throw new Error('Unable to identify current script for the component registration.');
    }

    const componentName = currentScript.dataset.name;
    if (!componentName) {
        throw new Error('Component name must be provided via data-name attribute on the script element.');
    }

    if (customElements.get(componentName)) {
        return;
    }

    class MySelect extends HTMLElement {
        constructor() {
            super();
            console.log('Hello, World from MySelect!');
        }
    }

    customElements.define(componentName, MySelect);
})();
