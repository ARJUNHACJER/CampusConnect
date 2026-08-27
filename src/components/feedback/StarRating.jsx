import React, { useState } from "react";
import { Star } from "lucide-react";

/**
 * StarRating
 * Dual-purpose: interactive selector (pass onChange) or read-only
 * display (omit onChange) — used by both the feedback form and the
 * admin analytics views.
 */
export default function StarRating({
  value = 0,
  onChange,
  size = 24,
  label,
  required = false,
}) {
  const [hovered, setHovered] = useState(0);
  const readOnly = !onChange;
  const display = hovered || value;

  return (
    <div>
      {label && (
        <p className="text-sm font-medium text-slate-300 mb-2">
          {label} {required && <span className="text-red-400">*</span>}
        </p>
      )}
      <div className="flex items-center gap-1" role={readOnly ? undefined : "radiogroup"} aria-label={label}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={readOnly}
            aria-checked={value === star}
            role={readOnly ? undefined : "radio"}
            aria-label={`${star} star${star > 1 ? "s" : ""}`}
            onMouseEnter={() => !readOnly && setHovered(star)}
            onMouseLeave={() => !readOnly && setHovered(0)}
            onClick={() => onChange?.(star)}
            className={`transition-transform ${readOnly ? "cursor-default" : "cursor-pointer hover:scale-110"}`}
          >
            <Star
              size={size}
              className={star <= display ? "text-amber-400" : "text-slate-600"}
              fill={star <= display ? "currentColor" : "none"}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
