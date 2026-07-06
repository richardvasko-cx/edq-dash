class CrCheckbox extends HTMLElement {
  static get observedAttributes() { return ['checked', 'disabled']; }
  
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    if (this.shadowRoot) {
      this.shadowRoot.innerHTML = `
        <style>
          :host {
            -webkit-tap-highlight-color: transparent;
            align-items: center;
            cursor: pointer;
            display: inline-flex;
            outline: none;
            user-select: none;
            
            /* Custom CSS Design Tokens */
            --cr-checkbox-border-size: 2px;
            --cr-checkbox-size: 16px;
            --cr-checkbox-ripple-size: 32px;
            --cr-checkbox-checked-box-color: #0b57d0;
            --cr-checkbox-ripple-checked-color: rgba(11, 87, 208, 0.15);
            --cr-checkbox-ripple-opacity: 1;
            --cr-checkbox-mark-color: #ffffff;
            --cr-checkbox-ripple-unchecked-color: rgba(148, 163, 184, 0.15);
            --cr-checkbox-unchecked-box-color: #94a3b8;
            --scale-duration: 140ms;
          }

          /* Disabled State */
          :host([disabled]) {
            cursor: initial;
            opacity: 0.38;
            pointer-events: none;
          }

          /* Ripple & hover container wrapper. Keeps compact height (16px) while allowing 32px width to prevent horizontal clipping. */
          #checkbox-wrapper {
            display: flex;
            align-items: center;
            justify-content: center;
            height: var(--cr-checkbox-size);
            width: var(--cr-checkbox-ripple-size);
            position: relative;
            flex-shrink: 0;
          }

          /* The outer box frame */
          #checkbox {
            background: none;
            border: var(--cr-checkbox-border-size) solid var(--cr-checkbox-unchecked-box-color);
            border-radius: 2px;
            box-sizing: border-box;
            cursor: pointer;
            display: block;
            flex-shrink: 0;
            height: var(--cr-checkbox-size);
            isolation: isolate;
            margin: 0px;
            outline: none;
            padding: 0px;
            position: relative;
            width: var(--cr-checkbox-size);
            z-index: 2;
            transition: background var(--scale-duration) ease-out, border-color var(--scale-duration) ease-out;
          }

          :host([disabled][checked]) #checkbox {
            border-color: transparent;
          }

          /* Hover background circle overlay */
          #hover-layer {
            display: none;
          }

          :host(:hover) #hover-layer {
            background-color: var(--cr-checkbox-ripple-unchecked-color);
            border-radius: 50%;
            display: block;
            height: var(--cr-checkbox-ripple-size);
            left: 0;
            pointer-events: none;
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            width: var(--cr-checkbox-ripple-size);
            z-index: 1;
          }

          :host([checked]:hover) #hover-layer {
            background-color: var(--cr-checkbox-ripple-checked-color);
          }

          #checkbox:focus-visible {
            outline: 2px solid var(--cr-checkbox-checked-box-color);
            outline-offset: 2px;
          }

          /* Checkmark SVG Animation */
          #checkmark {
            display: block;
            position: relative;
            transform: scale(0);
            z-index: 3;
            transition: transform var(--scale-duration) ease-out;
          }

          #checkmark path {
            fill: var(--cr-checkbox-mark-color);
          }

          :host([checked]) #checkmark {
            transform: scale(1);
          }

          :host([checked]) #checkbox {
            background: var(--cr-checkbox-checked-box-color);
            border-color: var(--cr-checkbox-checked-box-color);
          }

          /* Material Dynamic Ripple Ink */
          #ink {
            position: absolute;
            border-radius: 50%;
            background: var(--cr-checkbox-ripple-unchecked-color);
            height: var(--cr-checkbox-ripple-size);
            width: var(--cr-checkbox-ripple-size);
            left: 0;
            top: 50%;
            transform: translateY(-50%) scale(0);
            pointer-events: none;
            opacity: 0;
            z-index: 1;
            transition: transform 120ms linear, opacity 80ms linear;
          }

          :host([checked]) #ink {
            background: var(--cr-checkbox-ripple-checked-color);
          }

          #ink.animate {
            transform: translateY(-50%) scale(1);
            opacity: 1;
          }

          /* Text Label */
          #labelContainer {
            color: inherit;
            padding-inline-start: 12px;
            font-family: inherit;
            font-size: var(--cr-checkbox-font-size, 14px);
          }
        </style>

        <div id="checkbox-wrapper">
          <div id="checkbox" role="checkbox" aria-checked="false" tabindex="0">
            <svg id="checkmark" width="100%" height="100%" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" clip-rule="evenodd" d="m10.192 2.121-6.01 6.01-2.121-2.12L1 7.07l2.121 2.121.707.707.354.354 7.071-7.071-1.06-1.06Z"></path>
            </svg>
          </div>
          <div id="hover-layer"></div>
          <div id="ink"></div>
        </div>
        <div id="labelContainer">
          <slot></slot>
        </div>
      `;
    }

    // Toggle state on component click
    this.addEventListener('click', () => {
      if (this.hasAttribute('disabled')) return;
      this.toggleState();
    });

    // Accessibility keyboard support (Space / Enter)
    this.addEventListener('keydown', (e) => {
      if (this.hasAttribute('disabled')) return;
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        this.toggleState();
      }
    });
  }

  toggleState() {
    const isChecked = !this.hasAttribute('checked');
    if (isChecked) {
      this.setAttribute('checked', '');
    } else {
      this.removeAttribute('checked');
    }
    this.dispatchEvent(new CustomEvent('change', {
      detail: { checked: isChecked },
      bubbles: true,
      composed: true
    }));
    this.triggerRipple();
  }

  triggerRipple() {
    if (!this.shadowRoot) return;
    const ink = this.shadowRoot.getElementById('ink');
    if (ink) {
      ink.classList.add('animate');
      setTimeout(() => {
        ink.classList.remove('animate');
      }, 180);
    }
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (!this.shadowRoot) return;
    const checkbox = this.shadowRoot.getElementById('checkbox');
    if (checkbox && name === 'checked') {
      const isChecked = this.hasAttribute('checked');
      checkbox.setAttribute('aria-checked', isChecked ? 'true' : 'false');
    }
  }
}

if (!customElements.get('cr-checkbox')) {
  customElements.define('cr-checkbox', CrCheckbox);
}

export {};
