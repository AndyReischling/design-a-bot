"use client";

import { forwardRef, type InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  helperText?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, helperText, className = "", id, ...props }, ref) => {
    const inputId = id || label.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={inputId}
          className="font-sans text-xs font-medium uppercase tracking-widest text-bone"
        >
          {label}
        </label>
        <input
          ref={ref}
          id={inputId}
          className={`
            w-full rounded-lg border border-white/[0.06] bg-void
            px-4 py-3 font-sans text-base text-bone
            placeholder:text-bone
            transition-all duration-200
            focus:border-orchid/40 focus:outline-none
            focus:shadow-[0_0_0_3px_rgba(155,109,255,0.1)]
            ${className}
          `}
          {...props}
        />
        {helperText && (
          <p className="font-sans text-xs text-bone italic">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
