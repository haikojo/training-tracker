import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';
import './input.css';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hideLabel?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hideLabel = false, id, className = '', ...props },
  ref
) {
  const inputId = id ?? props.name;

  return (
    <label className="ui-input-field" htmlFor={inputId}>
      <span className={hideLabel ? 'sr-only' : 'ui-input-label'}>{label}</span>
      <input ref={ref} id={inputId} className={['ui-input', className].filter(Boolean).join(' ')} {...props} />
    </label>
  );
});
