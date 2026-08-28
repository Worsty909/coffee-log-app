"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/brew/new", label: "Připravit" },
  { href: "/beans", label: "Zrnka" },
  { href: "/profiles", label: "Recepty" },
  { href: "/settings", label: "Vybavení" },
];

export function NavLinks() {
  const pathname = usePathname();

  return (
    <>
      {NAV.map((item) => {
        // Detail i editace zrnka spadají pod "Zrnka", proto porovnáváme
        // i začátek cesty, ne jen přesnou shodu.
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`text-sm transition ${
              active ? "font-medium text-stone-100" : "text-stone-400 hover:text-stone-200"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </>
  );
}
