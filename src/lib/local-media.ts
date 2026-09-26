import { createStore, get, set, keys } from "idb-keyval";

/** وسائط الأستاذ تُحفظ في IndexedDB داخل الجهاز (تعمل بدون إنترنت). */
const store = () => createStore("svt-teacher-media", "files");

export const MEDIA_PREFIX = "idb:";
export const MAX_MEDIA_BYTES = 200 * 1024 * 1024;

export async function saveLocalMedia(file: Blob, id: string = crypto.randomUUID()): Promise<string> {
  await set(id, file, store());
  return id;
}

export async function getLocalMedia(id: string): Promise<Blob | undefined> {
  return get<Blob>(id, store());
}

export async function listLocalMediaIds(): Promise<string[]> {
  return (await keys(store())).map(String);
}

export function mediaIdsInWorkspace(workspace: unknown): string[] {
  const found = JSON.stringify(workspace).match(/"idb:([\w-]+)"/g) ?? [];
  return [...new Set(found.map((m) => m.slice(5, -1)))];
}
