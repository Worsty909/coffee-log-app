"use client";

// Tlačítko smazání receptu s potvrzovacím dialogem — stejný vzor jako
// u mazání zrnka, aby nešlo přijít o záznam jedním omylem klikem.
export function DeleteRecipeButton({ action }: { action: () => Promise<void> }) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!confirm("Opravdu smazat tenhle recept?")) {
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
