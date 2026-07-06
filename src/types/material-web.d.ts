import React from 'react';

// Import class types from @material/web to reference their DOM element types
import { MdFilledButton } from '@material/web/button/filled-button.js';
import { MdOutlinedButton } from '@material/web/button/outlined-button.js';
import { MdElevatedButton } from '@material/web/button/elevated-button.js';
import { MdTextButton } from '@material/web/button/text-button.js';
import { MdFilledTonalButton } from '@material/web/button/filled-tonal-button.js';
import { MdCheckbox } from '@material/web/checkbox/checkbox.js';
import { MdRadio } from '@material/web/radio/radio.js';
import { MdSwitch } from '@material/web/switch/switch.js';
import { MdOutlinedTextField } from '@material/web/textfield/outlined-text-field.js';
import { MdFilledTextField } from '@material/web/textfield/filled-text-field.js';
import { MdDialog } from '@material/web/dialog/dialog.js';
import { MdCircularProgress } from '@material/web/progress/circular-progress.js';
import { MdLinearProgress } from '@material/web/progress/linear-progress.js';
import { MdSlider } from '@material/web/slider/slider.js';
import { MdIcon } from '@material/web/icon/icon.js';
import { MdIconButton } from '@material/web/iconbutton/icon-button.js';
import { MdOutlinedIconButton } from '@material/web/iconbutton/outlined-icon-button.js';
import { MdFilledIconButton } from '@material/web/iconbutton/filled-icon-button.js';
import { MdFilledTonalIconButton } from '@material/web/iconbutton/filled-tonal-icon-button.js';
import { MdList } from '@material/web/list/list.js';
import { MdListItem } from '@material/web/list/list-item.js';
import { MdMenu } from '@material/web/menu/menu.js';
import { MdMenuItem } from '@material/web/menu/menu-item.js';
import { MdTabs } from '@material/web/tabs/tabs.js';
import { MdPrimaryTab } from '@material/web/tabs/primary-tab.js';
import { MdSecondaryTab } from '@material/web/tabs/secondary-tab.js';
import { MdDivider } from '@material/web/divider/divider.js';
import { MdFab } from '@material/web/fab/fab.js';

// Define helper types for custom element events and properties in React 19
type CustomElementProps<T> = React.DetailedHTMLProps<React.HTMLAttributes<T>, T>;

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'md-filled-button': CustomElementProps<MdFilledButton> & {
        disabled?: boolean;
        href?: string;
        target?: string;
        type?: 'button' | 'submit' | 'reset';
        value?: string;
        name?: string;
        form?: string;
      };
      'md-outlined-button': CustomElementProps<MdOutlinedButton> & {
        disabled?: boolean;
        href?: string;
        target?: string;
        type?: 'button' | 'submit' | 'reset';
        value?: string;
        name?: string;
        form?: string;
      };
      'md-elevated-button': CustomElementProps<MdElevatedButton> & {
        disabled?: boolean;
        href?: string;
        target?: string;
        type?: 'button' | 'submit' | 'reset';
        value?: string;
        name?: string;
        form?: string;
      };
      'md-text-button': CustomElementProps<MdTextButton> & {
        disabled?: boolean;
        href?: string;
        target?: string;
        type?: 'button' | 'submit' | 'reset';
        value?: string;
        name?: string;
        form?: string;
      };
      'md-filled-tonal-button': CustomElementProps<MdFilledTonalButton> & {
        disabled?: boolean;
        href?: string;
        target?: string;
        type?: 'button' | 'submit' | 'reset';
        value?: string;
        name?: string;
        form?: string;
      };
      'md-checkbox': CustomElementProps<MdCheckbox> & {
        checked?: boolean;
        disabled?: boolean;
        indeterminate?: boolean;
        name?: string;
        value?: string;
        required?: boolean;
      };
      'cr-checkbox': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        checked?: boolean | string;
        disabled?: boolean | string;
        class?: string;
        ref?: React.RefObject<any>;
      };
      'md-radio': CustomElementProps<MdRadio> & {
        checked?: boolean;
        disabled?: boolean;
        name?: string;
        value?: string;
        required?: boolean;
      };
      'md-switch': CustomElementProps<MdSwitch> & {
        checked?: boolean;
        disabled?: boolean;
        name?: string;
        value?: string;
        required?: boolean;
        icons?: boolean;
        showOnlySelectedIcon?: boolean;
      };
      'md-outlined-text-field': CustomElementProps<MdOutlinedTextField> & {
        disabled?: boolean;
        error?: boolean;
        errorText?: string;
        label?: string;
        placeholder?: string;
        prefixText?: string;
        suffixText?: string;
        supportingText?: string;
        type?: string;
        value?: string;
        required?: boolean;
        min?: string | number;
        max?: string | number;
        step?: string | number;
        maxLength?: number;
        minLength?: number;
        pattern?: string;
        readOnly?: boolean;
        multiple?: boolean;
        rows?: number;
        cols?: number;
      };
      'md-filled-text-field': CustomElementProps<MdFilledTextField> & {
        disabled?: boolean;
        error?: boolean;
        errorText?: string;
        label?: string;
        placeholder?: string;
        prefixText?: string;
        suffixText?: string;
        supportingText?: string;
        type?: string;
        value?: string;
        required?: boolean;
        min?: string | number;
        max?: string | number;
        step?: string | number;
        maxLength?: number;
        minLength?: number;
        pattern?: string;
        readOnly?: boolean;
        multiple?: boolean;
        rows?: number;
        cols?: number;
      };
      'md-dialog': CustomElementProps<MdDialog> & {
        open?: boolean;
        type?: 'alert' | 'confirm';
        returnValue?: string;
        noFocusTrap?: boolean;
      };
      'md-circular-progress': CustomElementProps<MdCircularProgress> & {
        value?: number;
        max?: number;
        indeterminate?: boolean;
        fourColor?: boolean;
      };
      'md-linear-progress': CustomElementProps<MdLinearProgress> & {
        value?: number;
        max?: number;
        indeterminate?: boolean;
        fourColor?: boolean;
      };
      'md-slider': CustomElementProps<MdSlider> & {
        value?: number;
        valueStart?: number;
        valueEnd?: number;
        min?: number;
        max?: number;
        step?: number;
        range?: boolean;
        disabled?: boolean;
        labeled?: boolean;
      };
      'md-icon': CustomElementProps<MdIcon> & {
        // Allows referencing material icon name
      };
      'md-icon-button': CustomElementProps<MdIconButton> & {
        disabled?: boolean;
        href?: string;
        target?: string;
        type?: 'button' | 'submit' | 'reset';
        selected?: boolean;
        toggle?: boolean;
      };
      'md-outlined-icon-button': CustomElementProps<MdOutlinedIconButton> & {
        disabled?: boolean;
        href?: string;
        target?: string;
        type?: 'button' | 'submit' | 'reset';
        selected?: boolean;
        toggle?: boolean;
      };
      'md-filled-icon-button': CustomElementProps<MdFilledIconButton> & {
        disabled?: boolean;
        href?: string;
        target?: string;
        type?: 'button' | 'submit' | 'reset';
        selected?: boolean;
        toggle?: boolean;
      };
      'md-filled-tonal-icon-button': CustomElementProps<MdFilledTonalIconButton> & {
        disabled?: boolean;
        href?: string;
        target?: string;
        type?: 'button' | 'submit' | 'reset';
        selected?: boolean;
        toggle?: boolean;
      };
      'md-list': CustomElementProps<MdList>;
      'md-list-item': CustomElementProps<MdListItem> & {
        disabled?: boolean;
        type?: 'link' | 'button';
        href?: string;
        target?: string;
        headline?: string;
        supportingText?: string;
        multiLineSupportingText?: string;
        trailingSupportingText?: string;
      };
      'md-menu': CustomElementProps<MdMenu> & {
        anchor?: string | HTMLElement;
        open?: boolean;
        quick?: boolean;
        hasOverflow?: boolean;
        anchorCorner?: string;
        menuCorner?: string;
        stayOpenOnOutsideClick?: boolean;
        stayOpenOnFocusout?: boolean;
        defaultFocus?: 'first-item' | 'last-item' | 'list-root' | 'none';
      };
      'md-menu-item': CustomElementProps<MdMenuItem> & {
        disabled?: boolean;
        type?: 'link' | 'button';
        href?: string;
        target?: string;
        headline?: string;
        supportingText?: string;
        multiLineSupportingText?: string;
        trailingSupportingText?: string;
        selected?: boolean;
        keepOpen?: boolean;
      };
      'md-tabs': CustomElementProps<MdTabs> & {
        activeTabIndex?: number;
        autoActivate?: boolean;
      };
      'md-primary-tab': CustomElementProps<MdPrimaryTab> & {
        active?: boolean;
        inlineIcon?: boolean;
      };
      'md-secondary-tab': CustomElementProps<MdSecondaryTab> & {
        active?: boolean;
      };
      'md-divider': CustomElementProps<MdDivider> & {
        inset?: boolean;
        vertical?: boolean;
      };
      'md-fab': CustomElementProps<MdFab> & {
        variant?: 'surface' | 'primary' | 'secondary' | 'tertiary';
        size?: 'small' | 'medium' | 'large';
        label?: string;
        lowered?: boolean;
      };
    }
  }
}
