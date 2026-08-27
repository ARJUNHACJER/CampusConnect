// src/components/profile/ui/FormField.jsx
import React from "react";
import { theme } from "./theme";

export default function FormField({
  label,
  required,
  error,
  help,
  type = "text",
  value,
  onChange,
  options,
  placeholder,
  icon,
  as,
  suggestions,
  inputMode,
  pattern,
}) {
  const inputId = React.useId();
  const suggestionId = `${inputId}-suggestions`;

  return (
    <div>
      <label htmlFor={inputId} className={theme.label}>
        {label} {required && <span className="text-orange-400">*</span>}
      </label>

      <div className={`${theme.inputWrap} ${error ? "border-rose-500/60" : ""}`}>
        {icon && <span className="text-slate-500 text-sm shrink-0">{icon}</span>}

        {as === "select" || type === "select" ? (
          <select
            id={inputId}
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            className={`${theme.input} [&>option]:bg-[#181229]`}
          >
            <option value="">Select {label.toLowerCase()}</option>
            {(options || []).map((opt) => {
              // Options can be plain strings ("Male") or { value, label }
              // pairs when the stored value must differ from the shown text
              // (e.g. education type codes vs. their display labels).
              const optValue = typeof opt === "string" ? opt : opt.value;
              const optLabel = typeof opt === "string" ? opt : opt.label;
              return (
                <option key={optValue} value={optValue}>
                  {optLabel}
                </option>
              );
            })}
          </select>
        ) : as === "textarea" ? (
          <textarea
            id={inputId}
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            inputMode={inputMode}
            pattern={pattern}
            rows={3}
            className={`${theme.input} resize-none`}
          />
        ) : (
          <input
            id={inputId}
            type={type}
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            list={suggestions?.length ? suggestionId : undefined}
            className={theme.input}
          />
        )}
      </div>

      {suggestions?.length > 0 && (
        <datalist id={suggestionId}>
          {suggestions.map((suggestion) => <option key={suggestion} value={suggestion} />)}
        </datalist>
      )}

      {error ? <p className={theme.errorText}>{error}</p> : help ? <p className={theme.helpText}>{help}</p> : null}
    </div>
  );
}
