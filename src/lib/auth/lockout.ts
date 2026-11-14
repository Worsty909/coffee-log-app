// Zámek po chybných pokusech o PIN.
//
// Čtyřmístný PIN má jen 10 000 možností, takže jeho bezpečnost nestojí
// na PINu samotném, ale na tom, že ho nejde zkoušet rychle. Prvních pár
// překlepů je zdarma, pak se čekání s každým dalším pokusem zdvojnásobuje
// až na jeden pokus denně — projít všechny kombinace by trvalo desítky let.

/** Kolik chybných pokusů po sobě projde bez čekání. */
export const FREE_ATTEMPTS = 5;

const MAX_LOCK_MINUTES = 24 * 60;

/** Délka zámku v minutách po daném počtu chybných pokusů po sobě. */
export function lockMinutesAfter(failedAttempts: number): number {
  if (failedAttempts < FREE_ATTEMPTS) return 0;
  const doublings = Math.min(failedAttempts - FREE_ATTEMPTS, 11); // 2^11 > 24 h
  return Math.min(2 ** doublings, MAX_LOCK_MINUTES);
}

/** "za 1 minutu", "za 8 minut", "za 2 hodiny" — pro hlášku na přihlašovací stránce. */
export function describeWait(msRemaining: number): string {
  const minutes = Math.max(1, Math.ceil(msRemaining / 60_000));
  if (minutes < 60) {
    return `za ${minutes} ${minutes === 1 ? "minutu" : minutes < 5 ? "minuty" : "minut"}`;
  }
  const hours = Math.ceil(minutes / 60);
  return `za ${hours} ${hours === 1 ? "hodinu" : hours < 5 ? "hodiny" : "hodin"}`;
}
