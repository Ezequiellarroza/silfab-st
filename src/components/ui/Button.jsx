// src/components/ui/Button.jsx
export default function Button({ as: Tag = "button", className = "", ...props }) {
  return (
    <Tag
      className={
        "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium " +
        "bg-[var(--brand)] text-white shadow-sm transition " +
        "hover:bg-[var(--brand-600)] focus:outline-none focus:ring-2 focus:ring-[color:rgb(var(--ring))] " +
        "disabled:opacity-60 " + className
      }
      {...props}
    />
  );
}
