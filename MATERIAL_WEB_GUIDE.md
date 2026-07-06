# Material Web Component (@material/web) Guide

This guide describes how to use and customize Google's official **Material Design 3 Web Components** (`@material/web`) within this React 19 + TypeScript + Tailwind CSS 4 codebase.

---

## 🚀 Quick Start & Imports

To use a component, import its JavaScript bundle. You can do this at the top of the file where you are using the component, or globally in `src/main.tsx`.

```typescript
// Import components modularly
import '@material/web/button/filled-button.js';
import '@material/web/button/outlined-button.js';
import '@material/web/checkbox/checkbox.js';
import '@material/web/textfield/outlined-text-field.js';
```

Once imported, use the custom elements in your JSX:

```tsx
export function MyComponent() {
  return (
    <div className="flex flex-col gap-4 p-6">
      <md-outlined-text-field label="Name" placeholder="Enter your name" />
      <md-filled-button>Submit</md-filled-button>
    </div>
  );
}
```

---

## 🎨 Theme & Styling Integration

This project is configured with a Tailwind CSS v4 design system in `src/index.css`. We have mapped `@material/web`'s design tokens directly to the Tailwind CSS utility variables in `src/index.css`.

### 1. Global Color Sync
All `@material/web` components automatically sync with the active theme colors (light/dark mode) using standard properties:
* `--md-sys-color-primary` maps to `var(--color-primary)`
* `--md-sys-color-surface` maps to `var(--color-surface)`
* `--md-sys-color-on-surface` maps to `var(--color-on-surface)`
* `--md-sys-color-outline` maps to `var(--color-outline)`
* etc.

### 2. Custom Component Styling (Inline & Custom CSS)
You can override design tokens at a component level using standard inline styles or CSS classes:

```tsx
// Override specific button container color locally
<md-filled-button 
  style={{ '--md-filled-button-container-color': 'var(--color-heat-red)' } as React.CSSProperties}
>
  Destructive Action
</md-filled-button>
```

---

## ⚡ React 19 Integration & Events

React 19 treats Custom Elements as first-class citizens. You can pass complex data structures as properties and listen to events natively.

### 1. Props vs. Attributes
Pass boolean flags, strings, numbers, or callbacks directly:

```tsx
<md-checkbox checked={isChecked} disabled={isDisabled} />
```

### 2. Event Listeners
You can attach standard React camelCase listeners for standard events (e.g. `onChange`, `onClick`).
For custom events emitted by the custom elements (like `close` or `closed` on `md-dialog`), you can use standard React event properties or register an event listener using a React `useRef`:

```tsx
import { useRef, useEffect } from 'react';

export function DialogExample() {
  const dialogRef = useRef<any>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleClosed = (e: Event) => {
      console.log('Dialog closed! Return value:', dialog.returnValue);
    };

    dialog.addEventListener('closed', handleClosed);
    return () => dialog.removeEventListener('closed', handleClosed);
  }, []);

  return (
    <>
      <md-filled-button onClick={() => dialogRef.current?.show()}>Open Dialog</md-filled-button>
      <md-dialog ref={dialogRef}>
        <div slot="headline">Confirm Action</div>
        <div slot="content">Are you sure you want to proceed?</div>
        <div slot="actions">
          <md-text-button onClick={() => dialogRef.current?.close()}>Cancel</md-text-button>
          <md-filled-button onClick={() => dialogRef.current?.close('confirm')}>Ok</md-filled-button>
        </div>
      </md-dialog>
    </>
  );
}
```

---

## 📝 Common Element Cheat Sheet

Here are the most common `@material/web` elements and how to write them in React 19:

### Buttons
```tsx
import '@material/web/button/filled-button.js';
import '@material/web/button/outlined-button.js';
import '@material/web/button/text-button.js';

// Filled Button (High emphasis)
<md-filled-button>Filled Button</md-filled-button>

// Outlined Button (Medium emphasis)
<md-outlined-button>Outlined Button</md-outlined-button>

// Text Button (Low emphasis)
<md-text-button>Text Button</md-text-button>
```

### Text Fields
```tsx
import '@material/web/textfield/outlined-text-field.js';

<md-outlined-text-field
  label="Email Address"
  type="email"
  value={email}
  onInput={(e: any) => setEmail(e.target.value)}
  required
/>
```

### Checkbox & Switch
```tsx
import '@material/web/checkbox/checkbox.js';
import '@material/web/switch/switch.js';

<md-checkbox checked={checked} onChange={(e: any) => setChecked(e.target.checked)} />
<md-switch checked={enabled} onChange={(e: any) => setEnabled(e.target.checked)} />
```

### Progress Indicators
```tsx
import '@material/web/progress/circular-progress.js';
import '@material/web/progress/linear-progress.js';

// Indeterminate progress spinner
<md-circular-progress indeterminate />

// Determinate linear progress bar
<md-linear-progress value={0.7} />
```

### Tabs
```tsx
import '@material/web/tabs/tabs.js';
import '@material/web/tabs/primary-tab.js';

<md-tabs activeTabIndex={activeTab} onChange={(e: any) => setActiveTab(e.target.activeTabIndex)}>
  <md-primary-tab>Overview</md-primary-tab>
  <md-primary-tab>Reports</md-primary-tab>
  <md-primary-tab>Settings</md-primary-tab>
</md-tabs>
```

---

## 🛠️ TypeScript Configuration

Custom elements are declared globally in `src/types/material-web.d.ts`. This registers the custom elements under React's `JSX.IntrinsicElements` namespace so you do not see TypeScript compiler errors when typing `<md-filled-button>` or other `@material/web` elements.

If you add new elements from the library, declare them inside [src/types/material-web.d.ts](file:///Users/richardvasko/edq-dash/src/types/material-web.d.ts) using the following syntax:

```typescript
import { MdNewComponent } from '@material/web/newpath/new-component.js';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'md-new-component': CustomElementProps<MdNewComponent> & {
        customAttr?: boolean;
        customString?: string;
      };
    }
  }
}
```
