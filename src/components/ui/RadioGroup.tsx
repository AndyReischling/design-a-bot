"use client";

interface RadioGroupProps {
  label: string;
  helperText?: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}

export default function RadioGroup({
  label,
  helperText,
  value,
  onChange,
  options,
}: RadioGroupProps) {
  return (
    <div className="flex flex-col gap-2">
      <span className="font-sans text-xs font-medium uppercase tracking-widest text-ash">
        {label}
      </span>
      <div className="flex rounded-lg border border-white/[0.06] bg-void p-1">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`
              flex-1 rounded-md px-4 py-2.5 font-sans text-sm font-medium
              transition-all duration-200
              ${
                value === option.value
                  ? "bg-amber/15 text-amber shadow-[inset_0_0_12px_rgba(232,148,58,0.1)]"
                  : "text-ash hover:text-bone"
              }
            `}
          >
            {option.label}
          </button>
        ))}
      </div>
      {helperText && (
        <p className="font-sans text-xs text-ash/70 italic">{helperText}</p>
      )}
    </div>
  );
}
