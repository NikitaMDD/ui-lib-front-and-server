import type { Directive } from 'vue';
import type { MaskPattern } from "../types/pets/types.ts";

const masks: Record<string, { pattern: RegExp; formatter: (v: string) => string }> = {
    date: {
        pattern: /^\d{0,2}\.?\d{0,2}\.?\d{0,4}$/,
        formatter: (v: string) => {
            const digits = v.replace(/\D/g, '').slice(0, 8);
            let result = '';
            for (let i = 0; i < digits.length; i++) {
                if (i === 2 || i === 4) result += '.';
                result += digits[i];
            }
            return result;
        }
    },
    phone: {
        pattern: /^\+?7?\s?\(?\d{0,3}\)?\s?\d{0,3}-?\d{0,2}-?\d{0,2}$/,
        formatter: (v: string) => {
            const digits = v.replace(/\D/g, '').slice(0, 10);
            if (digits.length === 0) return '';
            if (digits.length <= 1) return `+7 (${digits}`;
            if (digits.length <= 4) return `+7 (${digits.slice(1)}`;
            if (digits.length <= 7) return `+7 (${digits.slice(1, 4)}) ${digits.slice(4)}`;
            if (digits.length <= 9) return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
            return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9)}`;
        }
    },
    numeric: {
        pattern: /^\d*$/,
        formatter: (v: string) => v.replace(/\D/g, '')
    }
};

export const vMask: Directive<HTMLInputElement, MaskPattern> = {
    mounted(el, binding) {
        attachMask(el, binding.value);
    },
    updated(el, binding) {
        if (binding.value !== binding.oldValue) {
            if ((el as any)._maskHandler) {
                el.removeEventListener('input', (el as any)._maskHandler);
            }
            attachMask(el, binding.value);
        }
    },
    beforeUnmount(el) {
        if ((el as any)._maskHandler) {
            el.removeEventListener('input', (el as any)._maskHandler);
            delete (el as any)._maskHandler;
            delete (el as any)._maskConfig;
            delete (el as any)._lastValidValue;
        }
    }
};

function attachMask(el: HTMLInputElement, mask: MaskPattern | undefined) {
    const config = typeof mask === 'string' ? masks[mask] : null;

    const handleInput = (e: Event) => {
        if ((e as any)._fromMask) return;

        const target = e.target as HTMLInputElement;
        let value = target.value;

        if (config) {
            value = config.formatter(value);
        } else if (mask instanceof RegExp) {
            if (!mask.test(value)) {
                target.value = (el as any)._lastValidValue || '';
                return;
            }
        } else if (typeof mask === 'function') {
            value = mask(value);
        }

        if (value !== target.value) {
            target.value = value;
        }

        (el as any)._lastValidValue = value;

        const formattedEvent = new InputEvent('input', { bubbles: true, cancelable: true });
        (formattedEvent as any)._fromMask = true;
        target.dispatchEvent(formattedEvent);
    };

    el.addEventListener('input', handleInput, { capture: true });

    (el as any)._maskHandler = handleInput;
    (el as any)._maskConfig = config;
    (el as any)._lastValidValue = el.value;
}