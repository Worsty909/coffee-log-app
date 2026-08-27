import Link from "next/link";

export default function HomePage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-neutral-900">Coffee Log & Brew Calculator</h1>
      <p className="text-neutral-600">
        Osobní deník ochutnávek kávy propojený s kalkulačkou poměrů a extrakce.
      </p>
      <Link
        href="/beans"
        className="inline-block rounded-md bg-amber-800 px-4 py-2 text-sm font-medium text-white hover:bg-amber-900"
      >
        Zobrazit zrnka →
      </Link>
    </div>
  );
}
