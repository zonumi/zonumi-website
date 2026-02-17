import type { MenuAction, MenuKey } from "@/components/desktop/desktop.types";

type MenuDropdownProps = {
  menuKey: MenuKey;
  items: MenuAction[];
  onAction: (action: MenuAction) => void;
};

const slugifyActionLabel = (label: string | undefined) => label?.toLowerCase().replace(/[^a-z0-9]+/g, "-");

export function MenuDropdown({ menuKey, items, onAction }: MenuDropdownProps) {
  return (
    <div
      className="absolute left-0 top-[calc(100%+2px)] z-30 w-52 border-2 border-black bg-white p-1 shadow-[3px_3px_0_#000]"
      data-testid={`menu-dropdown-${menuKey}`}
    >
      {items.map((action, index) =>
        action.separator ? (
          <div key={`separator-${menuKey}-${index}`} className="my-1 border-t border-black" role="separator" />
        ) : (
          <button
            key={action.label}
            type="button"
            onClick={() => (action.disabled ? null : onAction(action))}
            disabled={action.disabled}
            className={`block w-full px-2 py-1 text-left text-[11px] ${
              action.disabled ? "text-[#b3b3b3]" : "hover:bg-black hover:text-white"
            }`}
            data-testid={`menu-action-${slugifyActionLabel(action.label)}`}
          >
            {action.label}
          </button>
        )
      )}
    </div>
  );
}
