"use client";

import { forwardRef, useRef, useEffect, type TextareaHTMLAttributes } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  helperText?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, helperText, className = "", id, onChange, ...props }, ref) => {
    const inputId = id || label.toLowerCase().replace(/\s+/g, "-");
    const internalRef = useRef<HTMLTextAreaElement | null>(null);

    const setRefs = (node: HTMLTextAreaElement | null) => {
      internalRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current = node;
    };

    useEffect(() => {
      const el = internalRef.current;
      if (el) {
        el.style.height = "auto";
        el.style.height = el.scrollHeight + "px";
      }
    }, [props.value]);

    return (
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={inputId}
          className="font-sans text-xs font-medium uppercase tracking-widest text-ash"
        >
          {label}
        </label>
        <textarea
          ref={setRefs}
          id={inputId}
          rows={3}
          className={`
            w-full resize-none rounded-lg border border-white/[0.06] bg-void
            px-4 py-3 font-sans text-base text-bone
            placeholder:text-ash/50
            transition-all duration-200
            focus:border-orchid/40 focus:outline-none
            focus:shadow-[0_0_0_3px_rgba(155,109,255,0.1)]
            ${className}
          `}
          onChange={(e) => {
            const el = e.target;
            el.style.height = "auto";
            el.style.height = el.scrollHeight + "px";
            onChange?.(e);
          }}
          {...props}
        />
        {helperText && (
          <p className="font-sans text-xs text-ash/70 italic">{helperText}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
export default Textarea;
