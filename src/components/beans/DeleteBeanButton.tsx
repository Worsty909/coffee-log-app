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
        className="btn btn-sm btn-danger"
      >
        Smazat
      </button>
    </form>
  );
}
