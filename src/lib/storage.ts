// Ukládání nahraných fotek štítků.
//
// Tahle jednoduchá implementace ukládá soubory na lokální disk do
// `public/uploads` — funguje skvěle pro lokální vývoj i pro self-hosting
// na vlastním serveru. NEFUNGUJE ale na Vercelu (a jiném serverless
// hostingu), protože tam je souborový systém dočasný a při dalším
// requestu (nebo redeploy) o nahrané soubory přijdeš.
//
// Než appku nasadíš na Vercel, je potřeba `saveUploadedImage` přepsat na
// nahrávání do Vercel Blob (https://vercel.com/docs/storage/vercel-blob)
// — je to jediné místo v kódu, které se kvůli tomu musí změnit, zbytek
// appky pracuje jen s URL, kterou tahle funkce vrátí.
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "beans");

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export class UploadError extends Error {}

/**
 * Uloží nahranou fotku štítku a vrátí veřejnou URL, kterou lze rovnou
 * uložit do `Bean.photoUrl`.
 */
export async function saveUploadedImage(file: File): Promise<string> {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new UploadError("Podporované jsou jen obrázky JPEG, PNG nebo WebP.");
  }
  if (file.size > MAX_SIZE_BYTES) {
    throw new UploadError("Obrázek je moc velký (limit 5 MB).");
  }

  await mkdir(UPLOAD_DIR, { recursive: true });

  const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const filename = `${randomUUID()}.${extension}`;

  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(UPLOAD_DIR, filename), bytes);

  return `/uploads/beans/${filename}`;
}
