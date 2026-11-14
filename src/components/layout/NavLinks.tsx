"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BeanIcon, CupIcon, GearIcon, HomeIcon, RecipeIcon } from "@/components/ui/icons";

const NAV = [
  { href: "/", label: "Přehled", icon: HomeIcon },
  { href: "/beans", label: "Zrnka", icon: BeanIcon },
  { href: "/brew/new", label: "Připravit", icon: CupIcon, primary: true },
  { href: "/profiles", label: "Recepty", icon: RecipeIcon },
  { href: "/settings", label: "Vybavení", icon: GearIcon },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  // Detail i editace zrnka spadají pod "Zrnka", proto porovnáváme
  // i začátek cesty, ne jen přesnou shodu. Úprava uvařeného receptu
  // (/recipes/…) patří k zrnku, ze kterého se na ni chodí.
  if (href === "/beans" && pathname.startsWith("/recipes/")) return true;
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Odkazy v horní liště — jen na širších obrazovkách. */
export function TopNav() {
  const pathname = usePathname();
  if (pathname === "/login") return null;

  return (
    <div className="hidden items-center gap-1 sm:flex">
      {NAV.filter((item) => item.href !== "/").map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`rounded-lg px-3 py-1.5 text-sm transition ${
              active
                ? "bg-white/[0.07] font-medium text-stone-50"
                : "text-stone-400 hover:bg-white/[0.04] hover:text-stone-200"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}

/**
 * Spodní lišta na mobilu — appka se nejčastěji používá jednou rukou
 * u kávovaru, takže navigace patří k palci, ne nahoru. "Připravit" je
 * hlavní akce, proto je uprostřed a zvýrazněná.
 */
export function BottomNav() {
  const pathname = usePathname();
  // Na přihlašovací stránce navigace není — bez PINu stejně nikam nevede.
  if (pathname === "/login") return null;

  return (
    <nav
      aria-label="Hlavní navigace"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-[#14110f]/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg sm:hidden"
    >
      <ul className="mx-auto grid max-w-md grid-cols-5">
        {NAV.map((item) => {
          const active = isActive(pathname, item.href);
          const ItemIcon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex flex-col items-center gap-0.5 pt-2 pb-1.5 text-[10px] font-medium transition active:scale-95 ${
                  active ? "text-amber-400" : "text-stone-500"
                }`}
              >
                {item.primary ? (
                  <span
                    className={`-mt-5 flex h-12 w-12 items-center justify-center rounded-full bg-linear-to-b from-amber-500 to-amber-700 text-white shadow-lg shadow-amber-900/50 ring-4 ring-[#14110f] ${
                      active ? "brightness-110" : ""
                    }`}
                  >
                    <ItemIcon />
                  </span>
                ) : (
                  <ItemIcon className="h-6 w-6" />
                )}
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
