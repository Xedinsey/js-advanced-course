(() => {
    const componentName = document.currentScript.dataset.name;

    class MyCard extends HTMLElement {
        static observedAttributes = ['header', 'sub-header'];

        constructor() {
            super();
            const template = document.createElement('template');
            template.innerHTML = `
                <style>
                    :host { display: block; font: 15px system-ui, sans-serif; color: #334155; }
                    section { border: 1px solid #e2e8f0; border-radius: 10px; background: white; }
                    header { padding: 16px 20px; background: #f8fafc; border-bottom: 1px solid #e2e8f0; border-radius: 10px 10px 0 0; }
                    h2 { margin: 0; font-size: 18px; }
                    p { margin: 6px 0 0; color: #64748b; }
                    .content { padding: 24px 20px; }
                    footer { padding: 12px 20px; color: #64748b; }
                </style>
                <section>
                    <header>
                        <h2><slot name="header"><span class="header">Default header</span></slot></h2>
                        <p><slot name="sub-header"><span class="sub-header"></span></slot></p>
                    </header>
                    <div class="content"><slot></slot></div>
                    <footer><slot name="footer"></slot></footer>
                </section>
            `;
            this.attachShadow({ mode: 'open' }).append(template.content.cloneNode(true));
        }

        attributeChangedCallback(name, oldValue, newValue) {
            if (oldValue === newValue) return;
            this.shadowRoot.querySelector(`.${name}`).textContent = newValue
                ?? (name === 'header' ? 'Default header' : '');
        }
    }

    if (!customElements.get(componentName)) customElements.define(componentName, MyCard);
})();
