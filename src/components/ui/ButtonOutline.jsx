// src/components/ui/ButtonOutline.jsx
export default function ButtonOutline({ children, className="", ...props }) {
  return (
    <button
      className={
        "rounded-md border border-[var(--brand)] px-3 py-1.5 text-sm text-[var(--brand)] hover:bg-[var(--brand)] hover:text-white transition " +
        className
      }
      {...props}
    >
      {children}
    </button>
  );
}
