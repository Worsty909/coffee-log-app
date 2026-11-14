// Malá sada ikon jako inline SVG — bez závislosti na knihovně ikon.
// Všechny kreslí aktuální barvou textu (`currentColor`).
import type { SVGProps } from "react";

function Icon({ children, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export const HomeIcon = (props: SVGProps<SVGSVGElement>) => (
  <Icon {...props}>
    <path d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4.5v-5.5h-5V20H5a1 1 0 0 1-1-1z" />
  </Icon>
);

/** Šálek s párou — hlavní akce "Připravit" i logo appky. */
export const CupIcon = (props: SVGProps<SVGSVGElement>) => (
  <Icon {...props}>
    <path d="M5 10h11v4a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5z" />
    <path d="M16 11h1.5a2.5 2.5 0 0 1 0 5H16" />
    <path d="M8.5 3.5c-.8 1 .8 1.6 0 2.8M12.5 3.5c-.8 1 .8 1.6 0 2.8" />
  </Icon>
);

/** Kávové zrnko. */
export const BeanIcon = (props: SVGProps<SVGSVGElement>) => (
  <Icon {...props}>
    <ellipse cx="12" cy="12" rx="6" ry="8.5" transform="rotate(35 12 12)" />
    <path d="M8.2 17.4c1.2-3 5-3.6 5.2-6.6.1-1.9 1.3-3.3 2.4-4.2" />
  </Icon>
);

/** Recepty — seznam s fázemi. */
export const RecipeIcon = (props: SVGProps<SVGSVGElement>) => (
  <Icon {...props}>
    <rect x="5" y="3.5" width="14" height="17" rx="2.5" />
    <path d="M9 8.5h6M9 12h6M9 15.5h3.5" />
  </Icon>
);

/** Vybavení — posuvníky nastavení. */
export const GearIcon = (props: SVGProps<SVGSVGElement>) => (
  <Icon {...props}>
    <path d="M4 7h9M17 7h3M4 17h3M11 17h9" />
    <circle cx="15" cy="7" r="2" />
    <circle cx="9" cy="17" r="2" />
  </Icon>
);

export const SoundOnIcon = (props: SVGProps<SVGSVGElement>) => (
  <Icon {...props}>
    <path d="M4 9.500v5h3.500l4.5 4v-13l-4.5 4z" />
    <path d="M15.5 9a4 4 0 0 1 0 6M18 6.500a7.5 7.5 0 0 1 0 11" />
  </Icon>
);

export const SoundOffIcon = (props: SVGProps<SVGSVGElement>) => (
  <Icon {...props}>
    <path d="M4 9.500v5h3.500l4.5 4v-13l-4.5 4z" />
    <path d="m16 9.5 5 5M21 9.500l-5 5" />
  </Icon>
);

export const ChevronRightIcon = (props: SVGProps<SVGSVGElement>) => (
  <Icon {...props}>
    <path d="m9 6 6 6-6 6" />
  </Icon>
);
