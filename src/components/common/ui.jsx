import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import clsx from "clsx";
import { STATUS_META, PRIORITY_META } from "../../lib/constants";

export function StatusBadge({ status, size = "sm" }) {
  const meta = STATUS_META[status] || STATUS_META.planning;
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full font-medium",
        meta.bg,
        meta.text,
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-sm",
      )}
    >
      <span className={clsx("h-1.5 w-1.5 rounded-full", meta.dot)} />
      {meta.label}
    </span>
  );
}

export function PriorityBadge({ priority, size = "sm" }) {
  if (!priority) return null;
  const meta = PRIORITY_META[priority] || PRIORITY_META.medium;
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full font-medium ring-1",
        meta.bg,
        meta.text,
        meta.ring,
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-sm",
      )}
    >
      {meta.label}
    </span>
  );
}

export function Tag({ children, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-teal-500/10 px-2 py-0.5 text-xs font-medium text-teal-400">
      {children}
      {onRemove && (
        <button
          onClick={onRemove}
          className="rounded-full hover:bg-teal-500/20"
          aria-label="Remove tag"
        >
          <X size={11} />
        </button>
      )}
    </span>
  );
}

export function Button({
  variant = "default",
  size = "md",
  className,
  ...props
}) {
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center gap-1.5 rounded font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none",
        size === "sm" ? "px-2.5 py-1.5 text-xs" : "px-3.5 py-2 text-sm",
        variant === "default" &&
          "bg-copper-500 text-ink-900 hover:bg-copper-400",
        variant === "secondary" && "bg-ink-700 text-ink-100 hover:bg-ink-600",
        variant === "ghost" &&
          "bg-transparent text-ink-300 hover:bg-ink-800 hover:text-ink-100",
        variant === "danger" &&
          "bg-transparent text-rust-500 hover:bg-rust-500/10",
        className,
      )}
      {...props}
    />
  );
}

export function IconButton({ className, label, children, ...props }) {
  return (
    <button
      aria-label={label}
      title={label}
      className={clsx(
        "inline-flex h-8 w-8 items-center justify-center rounded text-ink-400 hover:bg-ink-700 hover:text-ink-100 transition-colors",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function Select({ className, children, ...props }) {
  return (
    <select
      className={clsx(
        "rounded border border-ink-600 bg-ink-800 px-2.5 py-1.5 text-sm text-ink-100",
        "focus:border-copper-400 focus:outline-none",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export function TextInput({ className, ...props }) {
  return (
    <input
      className={clsx(
        "w-full rounded border border-ink-600 bg-ink-800 px-3 py-2 text-sm text-ink-100 placeholder:text-ink-500",
        "focus:border-copper-400 focus:outline-none",
        className,
      )}
      {...props}
    />
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  width = "max-w-lg",
}) {
  const dialogRef = useRef(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!open) return;
    // Focus the dialog itself only on open — not on every render.
    dialogRef.current?.focus();
    const onKey = (e) => e.key === "Escape" && onCloseRef.current();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]); // deliberately excludes onClose — handled via ref above

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 pt-[8vh] backdrop-blur-sm">
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        className={clsx(
          "w-full rounded-lg border border-ink-700 bg-ink-800 shadow-panel focus:outline-none",
          width,
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-ink-700 px-5 py-3.5">
          <h2 className="font-display text-lg text-ink-100">{title}</h2>
          <IconButton label="Close" onClick={onClose}>
            <X size={18} />
          </IconButton>
        </div>
        <div className="max-h-[70vh] overflow-y-auto px-5 py-4">{children}</div>
        {footer && (
          <div className="flex justify-end gap-2 border-t border-ink-700 px-5 py-3.5">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export function EmptyState({ icon: Icon, title, hint }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-ink-700 px-6 py-14 text-center">
      {Icon && <Icon size={28} className="text-ink-600" />}
      <p className="font-medium text-ink-300">{title}</p>
      {hint && <p className="max-w-xs text-sm text-ink-500">{hint}</p>}
    </div>
  );
}
