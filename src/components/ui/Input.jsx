// src/components/ui/Input.jsx
export function Input({ className = "", ...props }) {
  return (
    <input
      className={
        "w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm " +
        "placeholder:text-gray-400 outline-none " +
        "focus:border-gray-300 focus:ring-2 focus:ring-[color:rgb(var(--ring))] " + className
      }
      {...props}
    />
  );
}
