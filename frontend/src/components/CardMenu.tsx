import { useEffect, useRef, useState } from "react";

type CardMenuProps = {
  onView: () => void;
  onArchive: () => void;
};

const KebabIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
    <circle cx="10" cy="4" r="1.5" />
    <circle cx="10" cy="10" r="1.5" />
    <circle cx="10" cy="16" r="1.5" />
  </svg>
);

function CardMenu({ onView, onArchive }: CardMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setIsOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setIsOpen(false);
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        aria-label="Employee actions"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((v) => !v)}
        className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
      >
        <KebabIcon />
      </button>

      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 z-10 mt-1 w-40 overflow-hidden rounded-md border border-gray-200 bg-white py-1 text-sm shadow-lg"
        >
          <button
            role="menuitem"
            onClick={() => {
              setIsOpen(false);
              onView();
            }}
            className="block w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50"
          >
            View details
          </button>
          <button
            role="menuitem"
            onClick={() => {
              setIsOpen(false);
              onArchive();
            }}
            className="block w-full px-4 py-2 text-left text-red-600 hover:bg-red-50"
          >
            Archive
          </button>
        </div>
      )}
    </div>
  );
}

export default CardMenu;
