import { useId } from "react";

type Option<T extends string> = { value: T; label: string; icon?: React.ReactNode };

export function Segmented<T extends string>(props: {
  label: string;
  value: T;
  options: Option<T>[];
  onChange: (v: T) => void;
  className?: string;
}) {
  const { label, value, options, onChange, className } = props;
  const name = useId();
  return (
    <div className={`segmented ${className ?? ""}`} role="radiogroup" aria-label={label}>
      {options.map((o) => (
        <label key={o.value} className="segmented__opt">
          <input type="radio" name={name} value={o.value} checked={o.value === value} onChange={() => onChange(o.value)} />
          <span>
            {o.icon}
            {o.label}
          </span>
        </label>
      ))}
    </div>
  );
}
