import { useCallback, useEffect, useRef, useState } from "react";

/**
 * useTimedMessage — a transient message that auto-dismisses.
 * -----------------------------------------------------------------------
 * Solves the recurring bug where a success/toast message stays visible
 * forever (or stacks duplicate timers on repeated clicks).
 *
 *   const { message, show, dismiss } = useTimedMessage(2500);
 *   show({ type: "success", text: "Profile saved" });
 *
 * Guarantees:
 *   - Only ONE timer is ever live; calling show() again restarts it
 *     cleanly (no overlapping timers flipping state unpredictably).
 *   - The timer is cleared on unmount (no setState-after-unmount warning).
 *   - dismiss() hides immediately and cancels the pending timer.
 *
 * `message` is `null` when nothing is showing, otherwise whatever value
 * was passed to show() (a string, or an object like { type, text }).
 */
export function useTimedMessage(duration = 2500) {
  const [message, setMessage] = useState(null);
  const timerRef = useRef(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const show = useCallback(
    (value, overrideDuration) => {
      clearTimer();
      setMessage(value);
      const ms = overrideDuration ?? duration;
      timerRef.current = setTimeout(() => {
        setMessage(null);
        timerRef.current = null;
      }, ms);
    },
    [clearTimer, duration]
  );

  const dismiss = useCallback(() => {
    clearTimer();
    setMessage(null);
  }, [clearTimer]);

  // Clean up any pending timer when the component unmounts.
  useEffect(() => clearTimer, [clearTimer]);

  return { message, show, dismiss };
}

export default useTimedMessage;
