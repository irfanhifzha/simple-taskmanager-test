# AGENTS.md — Simple Task Manager

Panduan ini ditujukan untuk AI agents yang bekerja pada codebase ini. Baca seluruh dokumen sebelum membuat perubahan apapun.

---

## 🗂️ Tech Stack

| Layer | Library / Tool |
|---|---|
| UI Framework | React 19 + ReactDOM |
| Language | TypeScript |
| Styling | Tailwind CSS v4 (via `@tailwindcss/vite`) |
| Build Tool | Vite 8 |
| Routing | React Router DOM v7 |
| Backend / DB | Firebase v12 (Auth + Firestore) |
| Drag & Drop | `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` |
| Linting | ESLint 10 |

---

## 🎯 Project Purpose & Design Philosophy

Aplikasi **Task Manager** berbasis web yang berfokus pada:

1. **Kemudahan membaca informasi** — layout harus informatif, ringkas, dan mudah di-scan secara visual.
2. **Kemudahan akses** — navigasi minimal, semua data terlihat langsung di halaman utama tanpa perlu navigasi berlapis.
3. **Responsif** — tampilan harus bekerja baik di mobile, tablet, maupun desktop.
4. **Akses publik** — siapapun (tanpa login) **boleh melihat** semua data dan men-download PDF via print.
5. **Akses terproteksi** — untuk **membuat atau mengedit** task, user **wajib login** terlebih dahulu.

---

## 📁 Struktur Proyek

```
simple-taskmanager-test/
├── public/
│   ├── favicon.svg
│   └── firebase-config.json        # Firebase config dimuat secara runtime (fetch)
├── src/
│   ├── main.tsx                    # Entry point React
│   ├── App.tsx                     # Router utama (BrowserRouter)
│   ├── firebase.ts                 # initializeFirebase() — async init dari public/firebase-config.json
│   ├── index.css                   # Global styles (Tailwind directives)
│   ├── components/
│   │   ├── Navbar.tsx              # Header: tanggal/jam realtime + AuthButton
│   │   ├── AuthButton.tsx          # Login/Logout dengan email+password Firebase Auth
│   │   ├── Modal.tsx               # Komponen modal generic / wrapper
│   │   ├── TodoView.tsx            # Kanban board todo dengan drag-and-drop (@dnd-kit)
│   │   ├── TodoGantt.tsx           # Gantt chart timeline untuk todo (day/hour granularity)
│   │   ├── CalendarView.tsx        # Kalender bulanan dengan multi-day event overlay
│   │   ├── ScheduleView.tsx        # Tabel jadwal mingguan (slot jam 07:00–22:00)
│   │   ├── AddTodoModal.tsx        # Form tambah todo baru
│   │   ├── EditTodoModal.tsx       # Form lihat/edit todo
│   │   ├── AddRencanaModal.tsx     # Form tambah calendar event
│   │   ├── EditRencanaModal.tsx    # Form lihat/edit calendar event
│   │   ├── AddScheduleModal.tsx    # Form tambah jadwal
│   │   ├── EditScheduleModal.tsx   # Form lihat/edit jadwal
│   │   ├── AddTugasModalAgain.tsx  # Form tambah sub-tugas pada jadwal
│   │   └── EditTugasModalAgain.tsx # Form lihat/edit sub-tugas pada jadwal
│   ├── pages/
│   │   ├── Home.tsx                # Halaman utama: TodoView + CalendarView + ScheduleView
│   │   └── NotFound.tsx            # Halaman 404
│   └── types/
│       └── ListTypes.ts            # Semua type, interface, dan style utility constants
├── firestore.rules                 # Firestore security rules
├── firebase.json
├── .firebaserc
├── vite.config.ts
└── package.json
```

---

## 🔐 Autentikasi & Otorisasi

### Cara Kerja

- **Metode login:** Email + Password melalui Firebase Authentication (`signInWithEmailAndPassword`).
- **Tidak ada Google OAuth** — meskipun judulnya menyebut "auth google firebase", implementasi aktual menggunakan email+password murni.
- Komponen [`AuthButton.tsx`](src/components/AuthButton.tsx) mengelola state login, modal login, dan logout.
- State user (`User | null`) di-propagate via `props` ke semua View (`user` prop dari `Props` type).

### Aturan Akses

| Aksi | Tanpa Login | Dengan Login |
|---|---|---|
| Melihat semua data | ✅ | ✅ |
| Melihat detail task | ✅ | ✅ |
| Print / Download PDF | ✅ | ✅ |
| Membuat task baru | ❌ (tombol disembunyikan/disabled) | ✅ |
| Mengedit / menghapus task | ❌ | ✅ |

### Firestore Security Rules

```
// Siapapun bisa baca
allow read: if true;

// Hanya user yang login bisa write
allow write: if request.auth != null;
```

### Pattern Implementasi Auth-Gate di Komponen

Selalu gunakan pattern berikut di komponen yang memiliki aksi write:

```tsx
// Dari Props type di ListTypes.ts
const isLoggedIn = !!user;

// Sembunyikan/disable tombol tambah/edit jika belum login
{isLoggedIn && (
  <button onClick={() => setIsOpen(true)}>+ Tambah</button>
)}

// Atau pass login state ke modal
setSelected({ task, login: isLoggedIn });
```

---

## 🔥 Firebase & Firestore

### Inisialisasi

Firebase **tidak** diinisialisasi secara langsung. Config dimuat secara async dari `public/firebase-config.json`:

```ts
// src/firebase.ts
export async function initializeFirebase() {
  const response = await fetch("./firebase-config.json");
  const firebaseConfig = await response.json();
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
}
```

> **PENTING:** Selalu pastikan `initializeFirebase()` dipanggil sebelum menggunakan `auth` atau `db`. Lihat `src/main.tsx`.

### Koleksi Firestore

| Koleksi | Type | Kunci Filter |
|---|---|---|
| `todos` | `TodoEvent` | `kategori`, `order` |
| `calendars` | `CalendarEvent` | `kategori`, `tahun` |
| `schedules` | `Schedule` | `kategori` |

### Pola Fetch

- **TodoView**: Menggunakan `onSnapshot` (realtime listener) + `orderBy("order")`.
- **CalendarView**: Menggunakan `getDocs` (one-shot) + filter `kategori` & `tahun`.
- **ScheduleView**: Menggunakan `getDocs` (one-shot) + filter `kategori`.
- **TodoGantt**: Menggunakan `onSnapshot` + filter `kategori`.

Selalu filter by `kategori` di Firestore query (bukan client-side) untuk efisiensi.

---

## 🧩 Data Types (src/types/ListTypes.ts)

### Core Types

```ts
type StatusColor = "green" | "blue" | "red" | "orange" | "purple" | "abu";
type TodoStatus = "todo" | "progress" | "done" | "archived";

type TodoEvent = {
  id: string;
  kategori: string;
  order: number;
  status: TodoStatus;
  title: string;
  subtitle: string;
  desc: string;
  tipe: StatusColor;
  note: string;
  peoples: string[];
  createdAt: Timestamp;
  startAt?: Timestamp;
  doneAt?: Timestamp;
  progressTarget?: Timestamp;
  doneTarget?: Timestamp;
};

type CalendarEvent = {
  id: string;
  bulan: number;           // 1-12
  tahun: number;
  tanggal: number[];       // Array tanggal, mendukung multi-day event
  task: string;
  content: string;
  peoples: string[];
  type: StatusColor;
  notes: string;
  kategori: string;
};

type Schedule = {
  id: string;
  dayIndex: number;        // 1=Senin ... 7=Minggu
  slots: number[];         // Array jam (7–22)
  course: string;
  room: string;
  peoples: string[];
  type: StatusColor;
  note: string;
  desc: string;
  tugasAgain: TugasAgain[];  // Sub-tugas yang melekat pada jadwal
  kategori: string;
};

type Props = {
  kategori?: string;
  user: User | null;
  onPrint: () => void;
};
```

### Style Utility Constants

Tersedia di `ListTypes.ts`, gunakan ini daripada menulis class Tailwind inline:

- `statusStyles` — `bg-{color}-600` untuk dot/badge
- `statusBorder` — kombinasi bg + before border + div bg untuk tooltip-style element
- `colorClasses` — border + bg + text untuk card/badge dengan state active
- `colorOutline` — border + bg + text dengan hover/active outline variant
- `statusStylesStatus` — warna per `TodoStatus`

---

## 🖼️ Komponen Utama

### TodoView (`src/components/TodoView.tsx`)

Kanban board dengan 4 kolom: **Todo → Progress → Done → Archived**.

- Drag-and-drop antar kolom menggunakan `@dnd-kit`.
- Perubahan order disimpan ke Firestore via `writeBatch`.
- Memiliki toggle view: **Gantt Chart** (`TodoGantt`).
- Kolom dapat disembunyikan via toggle visibility.
- Edit mode: memperlihatkan handle drag, menyembunyikan detail.

### CalendarView (`src/components/CalendarView.tsx`)

Kalender bulanan (Google Calendar-style).

- Multi-day events ditampilkan sebagai bar horizontal yang span antar kolom.
- Event single-day ditampilkan sebagai item di dalam cell.
- Navigasi bulan dengan tombol prev/next.
- Long events yang melewati batas minggu di-split per baris.

### ScheduleView (`src/components/ScheduleView.tsx`)

Tabel jadwal mingguan (time-slot grid).

- Baris = jam (07:00–22:00), Kolom = hari (Senin–Sabtu, weekend opsional).
- Live indicator: highlight slot jam yang sedang berlangsung hari ini.
- Setiap slot jadwal dapat memiliki `tugasAgain` (sub-tugas) yang dapat di-expand.
- Filter by `kelas` dan `tahun` via dropdown.

### TodoGantt (`src/components/TodoGantt.tsx`)

Gantt chart timeline horizontal untuk todo.

- Granularity: **day** (lebar 60px/unit) atau **hour** (50px/unit).
- Menampilkan: titik created, bar progress, bar done, target overlay (dashed).
- Overdue indicator (bar merah) jika `doneTarget` terlewati.
- Sort by: `status`, `createdAt`, `startAt`.

---

## 🖨️ Fitur Print / Download PDF

Diimplementasikan via `window.print()` native browser.

```tsx
// Di Home.tsx
const [printTarget, setPrintTarget] = useState<string | null>(null);

const handlePrint = (target: string) => {
  setPrintTarget(target);
  setTimeout(() => window.print(), 100);
};
```

- Setiap section (todo, calendar, schedule) memiliki `onPrint` prop.
- Saat print, section yang **tidak** dipilih mendapat class `print:hidden`.
- Elemen UI (navbar, tombol, dll) menggunakan `print:hidden` untuk disembunyikan saat cetak.
- Fitur ini **tersedia untuk semua user**, termasuk yang belum login.

---

## 🎨 Panduan Styling (Tailwind CSS v4)

### Prinsip Utama

1. **Tidak ada file konfigurasi Tailwind terpisah** — Tailwind v4 dikonfigurasi via `@tailwindcss/vite` plugin.
2. **Gunakan utility class Tailwind langsung** — hindari CSS custom kecuali benar-benar diperlukan.
3. **Responsive prefix:** `sm:`, `md:`, `lg:`, `xl:` — prioritaskan mobile-first.
4. **Print prefix:** `print:hidden`, `print:block`, `print:p-0`, dll — untuk kontrol print layout.
5. **Jangan hardcode warna HEX** — gunakan sistem warna dari `ListTypes.ts`.

### Pola Warna Konsisten

```tsx
// ✅ BENAR — gunakan konstanta dari ListTypes.ts
import { colorClasses, statusStyles } from "../types/ListTypes";
<div className={colorClasses[task.tipe]}>...</div>

// ❌ HINDARI — hardcode class per kondisi
<div className={task.tipe === "blue" ? "bg-blue-100 text-blue-800" : "..."}>
```

### Responsive Layout

- Halaman utama menggunakan `flex flex-col` dengan padding horizontal (`mx-5 px-4`).
- Tabel dan grid menggunakan `overflow-x-auto` untuk scroll horizontal di mobile.
- Navbar menggunakan `flex-wrap` untuk adaptasi di layar kecil.

---

## ⚡ Pola & Konvensi Penting

### Prop Drilling Auth

State `user` di-drill dari `Home.tsx` ke setiap View component:

```
Home.tsx (onAuthStateChanged)
  └── TodoView (user prop) → AddTodoModal, EditTodoModal
  └── CalendarView (user prop) → AddRencanaModal, EditRencanaModal
  └── ScheduleView (user prop) → AddScheduleModal, EditScheduleModal
```

Jangan implementasi auth state baru di komponen leaf — gunakan prop `user` yang sudah ada.

### Modal Pattern

Setiap fitur memiliki pasangan modal Add + Edit/View. Selalu periksa `isLoggedIn` sebelum memperbolehkan aksi write di dalam modal.

### Kategori

Field `kategori` adalah string identifier yang mengkelompokkan data (contoh: `"ClassA"`). Selalu pass dari parent ke child, jangan hardcode di komponen leaf.

### Timestamp

Gunakan `Timestamp` dari `firebase/firestore`. Untuk display, selalu panggil `.toDate()` terlebih dahulu.

---

## 🚫 Hal yang HARUS DIHINDARI

1. **Jangan expose Firebase credentials** di source code — config diambil dari `public/firebase-config.json` (runtime fetch).
2. **Jangan izinkan write tanpa auth** — selalu cek `isLoggedIn` di UI dan andalkan Firestore rules sebagai lapisan keamanan backend.
3. **Jangan fetch semua dokumen koleksi tanpa filter** — selalu sertakan filter `kategori` (dan `tahun` untuk calendars) di Firestore query.
4. **Jangan gunakan `useRealtime` (onSnapshot) untuk data yang tidak perlu update realtime** — gunakan `getDocs` untuk data statis seperti schedules dan calendars.
5. **Jangan ubah struktur `Props` type tanpa memperbarui semua komponen yang menggunakannya.**
6. **Jangan gunakan Google OAuth / `signInWithPopup`** — proyek ini menggunakan email+password murni.

---

## 🛠️ Development Commands

```bash
# Install dependencies
npm install

# Dev server (http://localhost:5173)
npm run dev

# Build production
npm run build

# Preview build
npm run preview

# Lint
npm run lint

# Deploy ke Firebase Hosting (setelah build)
firebase deploy
```

---

## ✅ Checklist Sebelum Membuat Perubahan

- [ ] Apakah perubahan ini membutuhkan login? Jika ya, tambahkan `isLoggedIn` guard.
- [ ] Apakah ada Firestore query baru? Pastikan ada filter `kategori`.
- [ ] Apakah ada UI baru? Pastikan responsive (mobile-first) dan punya `print:hidden` jika tidak relevan saat print.
- [ ] Apakah ada warna/style baru? Gunakan konstanta dari `ListTypes.ts`.
- [ ] Apakah ada type baru? Tambahkan ke `src/types/ListTypes.ts`.
- [ ] Apakah perubahan mempengaruhi `Props` type? Update semua komponen terkait.
