import React, { useEffect } from "react";

const severityStyles = {
  success:
    "border-emerald-500 bg-emerald-50 text-emerald-900",
  error:
    "border-red-500 bg-red-50 text-red-900",
  info:
    "border-sky-500 bg-sky-50 text-sky-900",
  warning:
    "border-amber-500 bg-amber-50 text-amber-900",
};

const MessagePopup = ({ open, setOpen, severity, message }) => {
  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => {
      setOpen(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, [open, setOpen]);

  if (!open) return null;

  const style =
    severityStyles[severity] ||
    "border-slate-300 bg-white text-slate-900";

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      <div
        className={`pointer-events-auto card flex max-w-sm items-start gap-3 border-l-4 px-4 py-3 shadow-lg transition transform duration-200 ease-out ${style}`}
      >
        <div className="flex-1 text-sm font-medium">
          {message}
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="ml-2 text-xs font-semibold text-slate-500 hover:text-slate-900"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default MessagePopup;
