import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MoreHorizontal } from "lucide-react";

interface OptionsMenuProps {
  onEdit?: () => void;
  onDelete?: () => void;
  deleteLabel?: string;
  extra?: { label: string; onClick: () => void; danger?: boolean }[];
  variant?: "default" | "light";
  size?: "default" | "sm";
  align?: "right" | "left";
  className?: string;
}

const OptionsMenu: React.FC<OptionsMenuProps> = ({
  onEdit,
  onDelete,
  deleteLabel = "Delete",
  extra = [],
  variant = "default",
  size = "default",
  align = "right",
  className = "relative ml-auto shrink-0",
}) => {
  const [open, setOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<{ top: number; right?: number; left?: number }>({ top: 0, right: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const hasItems = Boolean(onEdit || onDelete || extra.length);

  const placeMenu = () => {
    const button = buttonRef.current;
    if (!button) return;
    const rect = button.getBoundingClientRect();
    const estimatedHeight = 8 + (onEdit ? 36 : 0) + extra.length * 36 + (onDelete ? 36 : 0);
    const openUp = rect.bottom + 4 + estimatedHeight > window.innerHeight;
    setMenuPos({
      top: openUp ? Math.max(8, rect.top - estimatedHeight - 4) : rect.bottom + 4,
      right: align === "right" ? window.innerWidth - rect.right : undefined,
      left: align === "left" ? rect.left : undefined,
    });
  };

  useEffect(() => {
    if (!open) return;

    placeMenu();

    const close = (event: MouseEvent) => {
      const target = event.target as Node;
      if (buttonRef.current?.contains(target) || menuRef.current?.contains(target)) return;
      setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const onReposition = () => placeMenu();

    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", onReposition);
    window.addEventListener("scroll", onReposition, true);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onReposition);
      window.removeEventListener("scroll", onReposition, true);
    };
  }, [open]);

  if (!hasItems) return null;

  return (
    <div className={className}>
      <button
        ref={buttonRef}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((value) => !value);
        }}
        className={`rounded-full ${size === "sm" ? "p-1" : "p-1.5"} ${variant === "light" ? "hover:bg-white/15" : "hover:bg-wb-canvas"}`}
        aria-label="More options"
        aria-expanded={open}
      >
        <MoreHorizontal size={size === "sm" ? 16 : 18} className={variant === "light" ? "text-white" : "text-wb-muted"} />
      </button>
      {open &&
        createPortal(
          <div
            ref={menuRef}
            className="fixed z-[90] w-52 overflow-hidden rounded-xl border border-wb-line bg-white shadow-card"
            style={{ top: menuPos.top, right: menuPos.right, left: menuPos.left }}
            onClick={(e) => e.stopPropagation()}
          >
            {onEdit && (
              <button
                type="button"
                className="block w-full px-4 py-2 text-left text-sm font-bold hover:bg-wb-canvas"
                onClick={() => {
                  setOpen(false);
                  onEdit();
                }}
              >
                Edit
              </button>
            )}
            {extra.map((item) => (
              <button
                key={item.label}
                type="button"
                className={`block w-full px-4 py-2 text-left text-sm font-bold hover:bg-wb-canvas ${item.danger ? "text-red-500" : ""}`}
                onClick={() => {
                  setOpen(false);
                  item.onClick();
                }}
              >
                {item.label}
              </button>
            ))}
            {onDelete && (
              <button
                type="button"
                className="block w-full px-4 py-2 text-left text-sm font-bold text-red-500 hover:bg-wb-canvas"
                onClick={() => {
                  setOpen(false);
                  onDelete();
                }}
              >
              {deleteLabel}
            </button>
            )}
          </div>,
          document.body
        )}
    </div>
  );
};

export default OptionsMenu;

export function isOwnedBy(ownerId: unknown, userId: unknown) {
  if (ownerId == null || userId == null) return false;
  return String(ownerId) === String(userId);
}
