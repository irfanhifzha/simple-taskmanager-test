

function NotFound() {
  return (

    <div style={{ height: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", gap: 15 }}>
      <h1>404 - Page Not Found</h1>
      <img
        src="https://whatsticker.online/stickers_asset/ws-pack-680742Qec9J8A/c440fa20e0f63.webp"
        className="block h-50 -m-5 -mb-8"
        alt="404"
      />
      <p>Page yang kamu cari tidak ditemukan &nbsp;:(</p>
      <button className='text-md text-blue-600 cursor-pointer' onClick={() => window.location.href = "/"}>← Back</button>

    </div>
  );
}

export default NotFound;