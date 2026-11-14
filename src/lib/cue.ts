// Upozornění na přechod fáze časovače: zvuk + vibrace.
//
// Proč zvuk: iPhone webovým stránkám vibrace nedovolí (Safari
// `navigator.vibrate` vůbec nemá), takže jediný spolehlivý signál,
// který na něm jde vyvolat z časovače, je pípnutí. Android zavibruje
// i pípne.
//
// Běží jen v prohlížeči — volá se z klientských komponent.

const STORAGE_KEY = "coffee-log:timer-sound";

let audioContext: AudioContext | null = null;

type AudioSessionNavigator = Navigator & { audioSession?: { type: string } };

/**
 * Připraví zvuk. Musí se zavolat přímo z ťuknutí (tlačítko Start) —
 * prohlížeče nedovolí stránce začít hrát zvuk, dokud na ni uživatel
 * nesáhl. Později už pípnutí projde i z časovače.
 */
export function primeCues(): void {
  try {
    // iPhone: "playback" hraje i s přepnutým tichým režimem — bez toho
    // by časovač u většiny lidí mlčel.
    const nav = navigator as AudioSessionNavigator;
    if (nav.audioSession) nav.audioSession.type = "playback";

    audioContext ??= new AudioContext();
    if (audioContext.state === "suspended") void audioContext.resume();
  } catch {
    // Zvuk není k dispozici — časovač funguje dál, jen potichu.
  }
}

function beep(startOffset: number, frequency: number, duration: number): void {
  if (!audioContext) return;
  const start = audioContext.currentTime + startOffset;
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();

  oscillator.type = "sine";
  oscillator.frequency.value = frequency;
  // Krátký náběh a doběh, ať pípnutí nelupne.
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(0.5, start + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

  oscillator.connect(gain).connect(audioContext.destination);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.02);
}

/**
 * Haptika na iPhonu oklikou: iOS 18+ "cvakne" při přepnutí nativního
 * přepínače (`<input type="checkbox" switch>`). Je to jen pokus navíc —
 * Apple to z časovače (bez ťuknutí) nemusí pustit, pak se nestane nic.
 */
function iosHapticTick(): void {
  try {
    const label = document.createElement("label");
    label.ariaHidden = "true";
    label.style.display = "none";
    const input = document.createElement("input");
    input.type = "checkbox";
    input.setAttribute("switch", "");
    label.appendChild(input);
    document.head.appendChild(label);
    label.click();
    document.head.removeChild(label);
  } catch {
    // nevadí
  }
}

/**
 * Signál "další fáze" (jedno pípnutí) nebo "konec plánu" (dvě vyšší).
 */
export function playCue(kind: "phase" | "done"): void {
  if ("vibrate" in navigator) {
    navigator.vibrate(kind === "done" ? [120, 80, 120] : 150);
  } else {
    iosHapticTick();
  }

  if (!getSoundSetting()) return;
  if (kind === "phase") {
    beep(0, 880, 0.16);
  } else {
    beep(0, 1175, 0.14);
    beep(0.2, 1175, 0.22);
  }
}

// --- Zapnutí/vypnutí zvuku, zapamatované v prohlížeči ---

const listeners = new Set<() => void>();

export function subscribeSoundSetting(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getSoundSetting(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) !== "off";
  } catch {
    return true;
  }
}

export function setSoundSetting(enabled: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEY, enabled ? "on" : "off");
  } catch {
    // soukromý režim — nastavení vydrží jen do zavření stránky
  }
  listeners.forEach((listener) => listener());
}
