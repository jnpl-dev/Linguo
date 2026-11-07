# docs/preferences.md — @capacitor/preferences

Reference for the AI agent. Written from official docs on 2026-11-06. Source: https://capacitorjs.com/docs/apis/preferences (also v6/v7/next pages)
Rule: if this file disagrees with the installed package's type definitions in `node_modules/@capacitor/preferences/`, the installed types win. Record the difference in `progress.md`.

## Facts
- Simple persistent key/value store for lightweight data (SharedPreferences on Android).
- **Values are strings only.** Store objects with `JSON.stringify(...)`, read with `JSON.parse(...)`. `get` returns `null` for a missing key.
- Not a database: fine for Linguo's small history list (max 50 items).
- Stored data is cleared if the app is uninstalled.
- The iOS privacy manifest requirement does not apply (Android only).

## Install
```bash
npm install @capacitor/preferences
npx cap sync android
```

## API
```ts
import { Preferences } from '@capacitor/preferences';
```
| Method | Signature |
| --- | --- |
| `set` | `set(options: { key: string; value: string }): Promise<void>` |
| `get` | `get(options: { key: string }): Promise<{ value: string \| null }>` |
| `remove` | `remove(options: { key: string }): Promise<void>` |
| `clear` | `clear(): Promise<void>` (deletes ALL keys; do not use for "Clear all history", use `set` with `'[]'` or `remove` on `linguo_history`) |
| `keys` | `keys(): Promise<{ keys: string[] }>` |

## Linguo usage pattern (HistoryService)
```ts
const KEY = 'linguo_history';
const MAX_ITEMS = 50;

async function load(): Promise<HistoryItem[]> {
  const { value } = await Preferences.get({ key: KEY });
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];            // corrupt JSON => treat as empty, do not crash
  }
}

async function save(items: HistoryItem[]): Promise<void> {
  await Preferences.set({ key: KEY, value: JSON.stringify(items.slice(0, MAX_ITEMS)) });
}
```
- Add new items to the **front** of the array, then `save` (which trims to 50).
- "Clear all": `Preferences.remove({ key: KEY })` and reset the signal to `[]`.
