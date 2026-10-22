# Simple Task Manager

> Aplikasi task manager berbasis web yang berfokus pada tampilan informasi yang bersih — kanban board, kalender bulanan, dan tabel jadwal mingguan. Dibangun dengan React, Firebase, dan Tailwind CSS.

---

<p align="center">
  <a href="https://github.com/irfanhifzha/simple-taskmanager-test/archive/refs/heads/main.zip">
    <img src="https://img.shields.io/badge/⬇ Download%20ZIP-2ea44f?style=for-the-badge" alt="Download ZIP">
  </a>
  &nbsp;
  <a href="https://github.com/irfanhifzha/simple-taskmanager-test">
    <img src="https://img.shields.io/badge/GitHub-Lihat%20Repository-181717?style=for-the-badge&logo=github" alt="GitHub">
  </a>
</p>

---

## Apa Ini?

Ini adalah **task manager yang di-host sendiri dan sepenuhnya bisa dikustomisasi**, yang kamu deploy di bawah project Firebase milikmu sendiri. Tidak ada SaaS, tidak ada akun berbayar, tidak ada langganan — kamu yang memiliki data dan infrastrukturnya.

**Trade-off yang perlu diketahui:** Kamu perlu menyiapkan Firebase sendiri. Prosesnya sekitar 15 menit dan gratis di Firebase Spark plan untuk penggunaan pribadi atau tim kecil.

**Untuk siapa ini:**
- Developer yang ingin kanban board bersih yang bisa dimodifikasi dan dimiliki sendiri
- Tim kecil yang butuh tampilan kanban + kalender + jadwal bersama
- Siapapun yang ingin berkontribusi pada atau mem-fork task manager open-source ini

---

## Fitur

- **Kanban Board** — Kolom Todo / Progress / Done / Archived dengan drag-and-drop untuk mengubah urutan
- **Gantt Chart** — Tampilan timeline untuk todo dengan granularity hari/jam, indikator overdue, dan target overlay
- **Kalender Bulanan** — Gaya Google Calendar dengan bar event multi-hari dan tagging orang
- **Jadwal Mingguan** — Grid time-slot (07:00–22:00) dengan highlight slot aktif hari ini dan sub-tugas
- **PDF / Print** — Cetak bagian mana saja (kanban, kalender, atau jadwal) sebagai PDF bersih via print browser native
- **Akses baca publik** — Siapapun bisa melihat dan mencetak tanpa perlu login
- **Write terproteksi** — Membuat atau mengedit task memerlukan login (Firebase Email/Password Auth)
- **Responsif** — Bekerja di mobile, tablet, dan desktop

---

## Lisensi

**GNU General Public License v3.0 (GPL-3.0)**

Proyek ini adalah perangkat lunak bebas. Kamu bisa menggunakan, mempelajari, memodifikasi, dan mendistribusikannya — termasuk untuk keperluan komersial — selama kamu menjaga lisensi yang sama pada karya turunanmu. Lihat [`LICENSE`](LICENSE) untuk teks lengkapnya.

Singkatnya: **fork, modifikasi, deploy. Tetap open-source.**

---

## Download Tanpa Git

Jika kamu tidak menggunakan Git, unduh seluruh proyek sebagai ZIP:

**→ [Download ZIP (branch main)](https://github.com/irfanhifzha/simple-taskmanager-test/archive/refs/heads/main.zip)**

Ekstrak ZIP-nya, lalu ikuti langkah setup di bawah mulai dari **Langkah 2**.

---

## Panduan Setup Lengkap

### Prasyarat

Pastikan hal-hal berikut sudah terinstal sebelum mulai:

| Alat | Versi | Instal |
|---|---|---|
| Node.js | 18+ | https://nodejs.org |
| npm | ikut dengan Node | — |
| Firebase CLI | terbaru | `npm install -g firebase-tools` |
| Akun Firebase | gratis | https://firebase.google.com |

---

### Langkah 1 — Ambil Kode

**Opsi A: Git clone**
```bash
git clone https://github.com/irfanhifzha/simple-taskmanager-test.git
cd simple-taskmanager-test
```

**Opsi B: Download ZIP** (tanpa Git)

Download dari link di atas, ekstrak, lalu buka terminal di dalam folder hasil ekstrak.

---

### Langkah 2 — Instal Dependensi

```bash
npm install
```

---

### Langkah 3 — Siapkan Firebase Project

Kamu membutuhkan Firebase project milikmu sendiri. Aplikasi ini **tidak** berbagi backend — datamu tersimpan di Firestore milikmu sendiri.

#### 3a. Buat Firebase Project

1. Buka [console.firebase.google.com](https://console.firebase.google.com)
2. Klik **Add project** → beri nama bebas → Continue
3. Nonaktifkan Google Analytics jika tidak diperlukan → **Create project**

#### 3b. Buat Firestore Database

1. Di konsol Firebase, klik tanda **›** (expand) di sidebar kiri
2. Masuk ke **Database & Storage** → **Firestore** (di bawah tulisan "NoSQL")
3. Klik **Create database**
4. Pilih lokasi: **`asia-southeast2`** (Jakarta) — atau region terdekat dengan penggunamu
5. Mulai dengan **production mode** (file `firestore.rules` di proyek ini yang mengatur hak akses)
6. Klik **Enable**

#### 3c. Siapkan Autentikasi

1. Di konsol Firebase → **Security** → **Authentication**
2. Klik **Get started**
3. Di tab **Sign-in method**, aktifkan **Email/Password**
4. Masuk ke tab **Users** → klik **Add user**
5. Masukkan email dan password untuk akun admin kamu
6. Itu adalah kredensial login untuk membuat/mengedit task

#### 3d. Ambil Firebase Config

1. Di konsol Firebase → **Settings (⚙)** → **Project settings**
2. Scroll ke bawah ke bagian **Your apps**
3. Jika belum ada app, klik **Add app** → pilih **Web (`</>`)** → daftarkan dengan nama bebas
4. Salin nilai-nilai dari objek `firebaseConfig`

#### 3e. Isi File Config

Buka `public/firebase-config.json` di proyek dan ganti nilai placeholder dengan milikmu:

```json
{
  "apiKey": "API_KEY_KAMU",
  "authDomain": "PROJECT_ID_KAMU.firebaseapp.com",
  "projectId": "PROJECT_ID_KAMU",
  "storageBucket": "PROJECT_ID_KAMU.firebasestorage.app",
  "messagingSenderId": "MESSAGING_SENDER_ID_KAMU",
  "appId": "APP_ID_KAMU"
}
```

> **Catatan:** File ini ada di folder `public/` dan akan bisa diakses secara publik — itu memang disengaja dan aman. API key Firebase bukan rahasia; keamanan dikendalikan oleh Firestore rules dan Auth, bukan dengan menyembunyikan key-nya.

---

### Langkah 4 — Kustomisasi Proyek

**Ganti judul aplikasi:**

Di `index.html`, cari:
```html
<title>Simple Task Manager</title>
```
Ganti `Simple Task Manager` dengan nama aplikasimu. Perbarui juga teks di area logo dalam `<body>`.

**Ganti logo/favicon:**

Ganti `public/favicon.svg` dengan gambarmu sendiri. Perbarui referensi nama file di `index.html` jika kamu mengganti ekstensinya:
```html
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<img src="/favicon.svg" alt="logo" ...>
```

**Ganti identifier `kategori`:**

Di `src/pages/Home.tsx`, ketiga komponen view menggunakan `kategori="ClassA"`. Ganti `"ClassA"` dengan identifier yang mengelompokkan datamu (misalnya: nama kelas, nama tim, nama proyek):

```tsx
<TodoView kategori="NamaTimKamu" ... />
<CalendarView kategori="NamaTimKamu" ... />
<ScheduleView kategori="NamaTimKamu" ... />
```

---

### Langkah 5 — Deploy Firestore Rules

Proyek ini sudah menyertakan security rules di `firestore.rules`:

```
// Siapapun bisa baca
allow read: if true;

// Hanya user yang sudah login yang bisa write
allow write: if request.auth != null;
```

Deploy rules ke Firebase project kamu:

```bash
firebase login
```

```bash
firebase use simple-taskmanager-test-11509
```

> Ganti `simple-taskmanager-test-11509` dengan project ID Firebase milikmu (bisa dilihat di `.firebaserc` atau konsol Firebase).

```bash
firebase deploy --only firestore:rules
```

---

### Langkah 6 — Build & Deploy

```bash
npm run build
```

```bash
firebase deploy
```

Aplikasimu kini live di `https://PROJECT_ID_KAMU.web.app`.

---

### Development Lokal

Untuk menjalankan secara lokal tanpa deploy:

```bash
npm run dev
```

Buka di `http://localhost:5173`. Hot reload aktif.

> Kamu tetap membutuhkan `public/firebase-config.json` yang valid agar Firestore dan Auth berfungsi saat development lokal.

---

## Struktur Proyek (Referensi Cepat)

```
src/
├── components/
│   ├── TodoView.tsx          # Kanban board (drag-and-drop)
│   ├── TodoGantt.tsx         # Gantt chart timeline
│   ├── CalendarView.tsx      # Kalender bulanan
│   ├── ScheduleView.tsx      # Tabel jadwal mingguan
│   ├── AuthButton.tsx        # UI login / logout
│   ├── Navbar.tsx            # Bar atas dengan jam + auth
│   └── Modal.tsx             # Wrapper modal generic
├── pages/
│   └── Home.tsx              # Halaman utama (merakit semua view)
└── types/
    └── ListTypes.ts          # Semua TypeScript types + konstanta warna Tailwind
```

Dokumentasi arsitektur lengkap ada di [`AGENTS.md`](AGENTS.md).

---

## Berkontribusi

Pull request sangat disambut. Baca [`AGENTS.md`](AGENTS.md) sebelum membuat perubahan — di sana terdokumentasi konvensi kode, tipe data, pola auth, dan hal-hal yang harus dihindari.

**Cara berkontribusi:**

1. Fork repository ini
2. Buat branch: `git checkout -b feature/nama-fitur-kamu`
3. Buat perubahan (ikuti konvensi di `AGENTS.md`)
4. Commit: `git commit -m "feat: deskripsikan perubahanmu"`
5. Push dan buka Pull Request

Laporan bug dan ide fitur → [buka issue](https://github.com/irfanhifzha/simple-taskmanager-test/issues)

---

## FAQ

**Apakah ini gratis untuk digunakan dan dimodifikasi?**
Ya. GPL-3.0. Fork, ubah, deploy. Pertahankan lisensinya.

**Bolehkah digunakan untuk keperluan komersial?**
Boleh, selama kamu tetap membuka source code di bawah lisensi GPL-3.0 yang sama.

**Apakah Firebase berbayar?**
Firebase Spark plan (tier gratis) mencukupi untuk proyek pribadi dan tim kecil. Firestore memberikan 1 GiB penyimpanan dan 50K baca/20K tulis per hari secara gratis. Lihat [firebase.google.com/pricing](https://firebase.google.com/pricing).

**Bisakah digunakan oleh banyak orang sekaligus?**
Ya. Kanban board menggunakan Firestore realtime listener (`onSnapshot`) sehingga perubahan langsung terlihat oleh semua pengguna tanpa perlu refresh.

**Apakah orang bisa melihat task tanpa login?**
Ya. Membaca sepenuhnya publik. Hanya membuat atau mengedit yang memerlukan akun yang sudah login.

**Saya tidak ingin akses baca publik — bagaimana cara membatasinya?**
Ubah `allow read: if true;` menjadi `allow read: if request.auth != null;` di `firestore.rules`, lalu redeploy rules-nya.

---

## Dukungan

Kalau proyek ini berguna bagimu, sebuah ⭐ di GitHub membantu orang lain menemukannya.

[→ Beri Bintang di GitHub](https://github.com/irfanhifzha/simple-taskmanager-test)
