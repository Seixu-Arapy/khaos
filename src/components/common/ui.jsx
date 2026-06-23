import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import clsx from 'clsx';
import { STATUS_META, PRIORITY_META } from '../../lib/constants';

export function StatusBadge({ status, size = 'sm' }) {
  const meta = STATUS_META[status] || STATUS_META.planning;
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full font-medium',
        meta.bg,
        meta.text,
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm'
      )}
    >
      <span className={clsx('h-1.5 w-1.5 rounded-full', meta.dot)} />
      {meta.label}
    </span>
  );
}

export function PriorityBadge({ priority, size = 'sm' }) {
  if (!priority) return null;
  const meta = PRIORITY_META[priority] || PRIORITY_META.medium;
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full font-medium ring-1',
        meta.bg,
        meta.text,
        meta.ring,
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm'
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
  variant = 'default',
  size = 'md',
  className,
  ...props
}) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center gap-1.5 rounded font-medium transition-colors disabled:pointer-events-none disabled:opacity-50',
        size === 'sm' ? 'px-2.5 py-1.5 text-xs' : 'px-3.5 py-2 text-sm',
        variant === 'default' &&
          'bg-copper-500 text-ink-900 hover:bg-copper-400',
        variant === 'secondary' && 'bg-ink-700 text-ink-100 hover:bg-ink-600',
        variant === 'ghost' &&
          'text-ink-300 hover:bg-ink-800 hover:text-ink-100 bg-transparent',
        variant === 'danger' &&
          'text-rust-500 hover:bg-rust-500/10 bg-transparent',
        className
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
        'text-ink-400 hover:bg-ink-700 hover:text-ink-100 inline-flex h-8 w-8 items-center justify-center rounded transition-colors',
        className
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
        'border-ink-600 bg-ink-800 text-ink-100 rounded border px-2.5 py-1.5 text-sm',
        'focus:border-copper-400 focus:outline-hidden',
        className
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
        'border-ink-600 bg-ink-800 text-ink-100 placeholder:text-ink-500 w-full rounded border px-3 py-2 text-sm',
        'focus:border-copper-400 focus:outline-hidden',
        className
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
  width = 'max-w-lg',
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
    const onKey = (e) => e.key === 'Escape' && onCloseRef.current();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]); // deliberately excludes onClose — handled via ref above

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 pt-[8vh] backdrop-blur-xs">
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        className={clsx(
          'border-ink-700 bg-ink-800 shadow-panel w-full rounded-lg border focus:outline-hidden',
          width
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-ink-700 flex items-center justify-between border-b px-5 py-3.5">
          <h2 className="font-display text-ink-100 text-lg">{title}</h2>
          <IconButton label="Close" onClick={onClose}>
            <X size={18} />
          </IconButton>
        </div>
        <div className="max-h-[70vh] overflow-y-auto px-5 py-4">{children}</div>
        {footer && (
          <div className="border-ink-700 flex justify-end gap-2 border-t px-5 py-3.5">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export function EmptyState({ icon: Icon, title, hint }) {
  return (
    <div className="border-ink-700 flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed px-6 py-14 text-center">
      {Icon && <Icon size={28} className="text-ink-600" />}
      <p className="text-ink-300 font-medium">{title}</p>
      {hint && <p className="text-ink-500 max-w-xs text-sm">{hint}</p>}
    </div>
  );
}
