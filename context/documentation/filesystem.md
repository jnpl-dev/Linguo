# docs/filesystem.md — @capacitor/filesystem

Reference for the AI agent. Written from the official Capacitor v8 docs on 2026-11-08. Source: https://capacitorjs.com/docs/apis/filesystem
Rule: if this file disagrees with the installed package's type definitions in `node_modules/@capacitor/filesystem/`, the installed types win. Record the difference in `progress.md`.
Scope: this file is a **reference**. Where Linguo actually uses the Filesystem is defined in `architecture.md`. Do not use the Filesystem for anything `architecture.md` does not list.

## Facts
- Official Capacitor plugin: a NodeJS-like API for working with files on the device.
- Android and iOS (and web, with limitations). Linguo targets Android.
- Methods return Promises. Wrap every call in try/catch.
- iOS notes (privacy manifest, Files app keys) do not apply to Linguo (Android only).
- Not a database. For lots of structured data or complex queries a SQLite solution is recommended (not used in Linguo).

## Install
```bash
npm install @capacitor/filesystem
npx cap sync android
```
Check the installed version supports the installed Capacitor major version: `npm view @capacitor/filesystem peerDependencies`.

## Android rules (important)
- `Directory.Documents` and `Directory.ExternalStorage`: on **Android 10 and older** these need `READ_EXTERNAL_STORAGE` / `WRITE_EXTERNAL_STORAGE` permissions in `AndroidManifest.xml`.
- `Directory.Documents` is the **public** Documents folder, visible to other apps. On **Android 11 and newer the app can only access files and folders it created itself**. On Android 10 it is not accessible unless `android:requestLegacyExternalStorage="true"` is added to the `<application>` tag.
- `Directory.ExternalStorage` is **not accessible on Android 11 or newer**. Do not use it.
- Large files may need `android:largeHeap="true"` on the `<application>` tag. Not needed for Linguo's small files.
- Do not add storage permissions unless the test phone's Android version requires it for the directory actually used. Check the phone's Android version first and record it in `progress.md`.

## Directories (`Directory` enum, Android meaning)
| Member | Value | On Android | Persistence |
| --- | --- | --- | --- |
| `Data` | `'DATA'` | App-private files directory | Persistent; deleted on uninstall. **Default choice for app data.** |
| `Library` | `'LIBRARY'` | Same as app files directory | Persistent; deleted on uninstall |
| `LibraryNoCloud` | `'LIBRARY_NO_CLOUD'` | App files directory (iOS-specific meaning) | Persistent; deleted on uninstall |
| `Cache` | `'CACHE'` | App cache | May be deleted by the system when memory is low |
| `Temporary` | `'TEMPORARY'` | App cache | Same as cache |
| `ExternalCache` | `'EXTERNAL_CACHE'` | Primary external cache | May be cleared |
| `External` | `'EXTERNAL'` | App-owned folder on primary external storage | Persistent; deleted on uninstall; not typically visible to the user |
| `Documents` | `'DOCUMENTS'` | Public Documents folder | Survives uninstall; see Android rules above |
| `ExternalStorage` | `'EXTERNAL_STORAGE'` | Primary shared storage | Not accessible on Android 11+. Do not use |

Full paths: if you **leave out `directory`**, `path` is treated as a full `file://` path (or a `content://` URI on Android). Use this to read files returned by other plugins, such as the Camera's `uri`.

## Encoding rules
- `Encoding` enum: `UTF8 = 'utf8'`, `ASCII = 'ascii'` (Android only), `UTF16 = 'utf16'` (Android only).
- **Text files** (JSON, txt): always pass `encoding: Encoding.UTF8` for `readFile`, `writeFile`, and `appendFile`.
- **Binary files** (images, PDFs): pass **no** `encoding`. Data is then base64 (no `data:` prefix): `readFile` returns base64, and `writeFile` / `appendFile` expect base64.
- If you omit `encoding` and pass non-base64 data, an error is thrown.
- `readFile` returns `{ data: string | Blob }`; on native, `data` is always a string (Blob is web only).

## Methods
```ts
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
```
| Method | Signature | Notes |
| --- | --- | --- |
| `checkPermissions` | `() => Promise<{ publicStorage: PermissionState }>` | Android, only for `Documents` / `ExternalStorage` |
| `requestPermissions` | `() => Promise<{ publicStorage: PermissionState }>` | Same |
| `readFile` | `(options: ReadFileOptions) => Promise<{ data: string \| Blob }>` | |
| `readFileInChunks` | `(options: { path, directory?, chunkSize }, callback) => Promise<string>` | Native only; an empty chunk means done. Not needed for Linguo |
| `writeFile` | `(options: WriteFileOptions) => Promise<{ uri: string }>` | Overwrites an existing file |
| `appendFile` | `(options: AppendFileOptions) => Promise<void>` | |
| `deleteFile` | `(options: { path, directory? }) => Promise<void>` | |
| `mkdir` | `(options: MkdirOptions) => Promise<void>` | Errors if the directory already exists |
| `rmdir` | `(options: RmdirOptions) => Promise<void>` | |
| `readdir` | `(options: { path, directory? }) => Promise<{ files: FileInfo[] }>` | **Not recursive** |
| `getUri` | `(options: { path, directory? }) => Promise<{ uri: string }>` | Full file URI |
| `stat` | `(options: { path, directory? }) => Promise<FileInfo>` | |
| `rename` | `(options: CopyOptions) => Promise<void>` | File or directory |
| `copy` | `(options: CopyOptions) => Promise<{ uri: string }>` | File or directory |
| `downloadFile` and the `progress` listener | | **Deprecated since 7.1.0.** Do not use (Linguo makes no network requests) |

### Option details
| Interface | Properties |
| --- | --- |
| `ReadFileOptions` | `path` (string), `directory?`, `encoding?`, `offset?` (bytes, default 0, since 8.1.0), `length?` (bytes, default -1 = to end, since 8.1.0) |
| `WriteFileOptions` | `path`, `data` (string; Blob on web only), `directory?`, `encoding?`, `recursive?` (default `false`; creates missing parent directories) |
| `AppendFileOptions` | `path`, `data` (string), `directory?`, `encoding?` |
| `MkdirOptions` | `path`, `directory?`, `recursive?` (default `false`; creates missing parents) |
| `RmdirOptions` | `path`, `directory?`, `recursive?` (default `false`; remove contents too) |
| `CopyOptions` (also used by `rename`) | `from`, `to`, `directory?` (of `from`), `toDirectory?` (of `to`; defaults to `directory`) |

### FileInfo (from `readdir` and `stat`)
| Field | Type | Notes |
| --- | --- | --- |
| `name` | string | File or directory name |
| `type` | `'file' \| 'directory'` | |
| `size` | number | Bytes |
| `ctime` | number | Creation time in ms. **Not available on Android 7 and older.** May be undefined; fall back to `mtime` |
| `mtime` | number | Last modification time in ms |
| `uri` | string | Full file URI |

## Errors (native, plugin 7.1.0+)
Native errors carry `error.code`. Web does not follow this.
| Code | Meaning | Typical handling |
| --- | --- | --- |
| `OS-PLUG-FILE-0005` | Invalid method input parameters | Fix the code; log |
| `OS-PLUG-FILE-0006` | Invalid path | Fix the code; log |
| `OS-PLUG-FILE-0007` | Android: user denied permission | Toast; explain |
| `OS-PLUG-FILE-0008` | File does not exist | Treat as "not found" (e.g. first run: empty data) |
| `OS-PLUG-FILE-0009` | Operation not supported for the input | Log |
| `OS-PLUG-FILE-0010` | Directory already exists | Ignore when creating a folder you need |
| `OS-PLUG-FILE-0011` | Missing parent directory (`recursive` false or creation failed) | Use `recursive: true` |
| `OS-PLUG-FILE-0012` | Directory has children but `recursive` is false | Use `recursive: true` on `rmdir` |
| `OS-PLUG-FILE-0013` | The operation failed | Toast generic error |

## Patterns (adapt to `architecture.md`; do not copy blindly)

### Write and read a JSON file (text)
```ts
async function writeJson(path: string, value: unknown): Promise<void> {
  await Filesystem.writeFile({
    path,
    data: JSON.stringify(value),
    directory: Directory.Data,
    encoding: Encoding.UTF8,
    recursive: true,          // creates parent folders, so no separate mkdir is needed
  });
}

async function readJson<T>(path: string, fallback: T): Promise<T> {
  try {
    const { data } = await Filesystem.readFile({ path, directory: Directory.Data, encoding: Encoding.UTF8 });
    return JSON.parse(data as string) as T;
  } catch (e: any) {
    // Missing file (first run) or corrupt JSON: use the fallback, do not crash
    return fallback;
  }
}
```

### Ensure a folder exists
```ts
async function ensureDir(path: string): Promise<void> {
  try {
    await Filesystem.mkdir({ path, directory: Directory.Data, recursive: true });
  } catch (e: any) {
    if (e?.code !== 'OS-PLUG-FILE-0010') throw e;   // "already exists" is fine
  }
}
```

### List, rename, delete
```ts
const { files } = await Filesystem.readdir({ path: 'data', directory: Directory.Data });
const items = files.filter(f => f.type === 'file').sort((a, b) => b.mtime - a.mtime);

await Filesystem.rename({ from: 'data/old.json', to: 'data/new.json', directory: Directory.Data });
await Filesystem.deleteFile({ path: 'data/new.json', directory: Directory.Data });
```

### Export a copy to the public Documents folder
```ts
await Filesystem.writeFile({
  path: 'Linguo/history-export.json',
  data: JSON.stringify(history, null, 2),
  directory: Directory.Documents,
  encoding: Encoding.UTF8,
  recursive: true,
});
```
Verify on the test phone that the file appears in a file manager (see Android rules).

### Copy a file returned by another plugin
Use `from` as a full `file://` URI with no `directory`, and a target in a `toDirectory`:
```ts
await Filesystem.copy({ from: photoUri, to: 'images/photo.jpg', toDirectory: Directory.Data });
```
(Only if `architecture.md` says images are stored. By default Linguo does NOT store images.)

## Design rules for Linguo
- Default location for app data: `Directory.Data`. Use `Documents` only for user-facing exports.
- Use `Encoding.UTF8` for text and no encoding for binary files.
- Treat a missing file as "empty", not as an error.
- Keep Filesystem calls inside services, never in pages.
- Never store sensitive data in `Documents`.
- Files in `Cache` and `Temporary` can disappear; do not keep user data there.

## Still to verify on device
- The Android version of the test phone, and whether writing to `Directory.Documents` works without permissions on it.
- Whether `ctime` is present on the test phone (fall back to `mtime` if not).
- That the error code for an existing directory is `OS-PLUG-FILE-0010` on the test phone.
