import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hideLabel?: boolean;
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(function TextInput(
  { label, hideLabel = false, id, className = '', ...props },
  ref
) {
  const inputId = id ?? props.name;

  return (
    <label className="input-field" htmlFor={inputId}>
      <span className={hideLabel ? 'sr-only' : 'input-label'}>{label}</span>
      <input
        ref={ref}
        id={inputId}
        className={['text-input', className].filter(Boolean).join(' ')}
        {...props}
      />
    </label>
  );
});
