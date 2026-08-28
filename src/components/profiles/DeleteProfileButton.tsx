"use client";

// Smazání receptu — stejný vzor potvrzovacího dialogu jako u mazání
// zrnka nebo receptu v historii.
export function DeleteProfileButton({ action }: { action: () => Promise<void> }) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!confirm("Opravdu smazat tenhle recept? Starým záznamům v historii zůstane jen název metody.")) {
          event.preventDefault();
        }
      }}
    >
      <button type="submit" className="text-xs text-red-500 hover:underline">
        Smazat
      </button>
    </form>
  );
}
