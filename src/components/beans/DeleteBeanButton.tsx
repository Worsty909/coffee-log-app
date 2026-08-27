"use client";

// Tlačítko smazání s potvrzovacím dialogem prohlížeče — pro tak
// nevratnou akci nechceme, aby šlo smazat zrnko jedním klikem omylem.
export function DeleteBeanButton({ action }: { action: () => Promise<void> }) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!confirm("Opravdu smazat toto zrnko i se všemi jeho recepty?")) {
          event.preventDefault();
        }
      }}
    >
      <button
        type="submit"
        className="rounded-md border border-red-300 px-3 py-1.5 text-sm text-red-700 hover:bg-red-50"
      >
        Smazat
      </button>
    </form>
  );
}
