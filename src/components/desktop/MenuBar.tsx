"use client";

import Image from "next/image";
import { MenuDropdown } from "@/components/desktop/MenuDropdown";
import type { MenuAction, MenuKey } from "@/components/desktop/desktop.types";

type MenuBarProps = {
  company: string;
  clockText: string;
  menus: Array<{ key: MenuKey; items: MenuAction[] }>;
  activeMenu: MenuKey | null;
  onToggleMenu: (key: MenuKey) => void;
  onAction: (action: MenuAction) => void;
};

export function MenuBar({ company, clockText, menus, activeMenu, onToggleMenu, onAction }: MenuBarProps) {
  return (
    <header className="desktop-menu-bar border-b-2 border-black bg-white px-3 py-1 sm:px-5">
      <div className="flex w-full items-center gap-2 sm:gap-3">
        <Image
          src="/branding/brand/zonumi-menu-icon.png"
          alt="Zonumi"
          width={18}
          height={18}
          priority
          className="block h-[18px] w-[18px] shrink-0 translate-y-px object-cover object-center [image-rendering:pixelated]"
        />
        <p className="text-xs font-semibold leading-none sm:text-sm">{company}</p>
        {menus.map(({ key, items }) => (
          <div key={key} className="relative" onClick={(event) => event.stopPropagation()}>
            <button
              type="button"
              onClick={() => onToggleMenu(key)}
              className={`desktop-menu-trigger px-2 py-0.5 ${activeMenu === key ? "bg-black text-white" : "hover:bg-black hover:text-white"}`}
              data-testid={`menu-trigger-${key}`}
            >
              {key[0].toUpperCase() + key.slice(1)}
            </button>
            {activeMenu === key ? <MenuDropdown menuKey={key} items={items} onAction={onAction} /> : null}
          </div>
        ))}

        <p className="desktop-menu-clock ml-auto hidden sm:block">{clockText}</p>
      </div>
    </header>
  );
}
