import Gif from "../assets/loading.gif";


function NotFound() {
  return (
    
    <div style={{height: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", gap:15}}>
      <h1>404 - Page Not Found</h1>
      <p>The page you are looking for does not exist.</p>
        <img src={Gif} style={{display: "block", height:200}}></img>
      <p>jangan kesini dulu brow..</p>
      <button className='bg-red-500 rounded-md p-2 cursor-pointer' onClick={() => window.location.href = "/"}>Back</button>
      
    </div>
  );
}

export default NotFound;