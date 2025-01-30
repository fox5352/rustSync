import { invoke } from "@tauri-apps/api/core"
import "./App.css";
import { useEffect, useState } from "react";

function App() {
  const [address, setAddress] = useState<string|null>(null);

  const getIpv4Address = async () => {
    const res = await invoke("get_server_address");
    
    if (res) {
      setAddress(`${res}:${9090}`);
    }
  }

  useEffect(()=>{
    getIpv4Address();
  },[])

  return (
    <main className="container bg-emerald-500">
      Lorem ipsum dolor, sit amet consectetur adipisicing elit. Quos quidem, 
      commodi natus dignissimos hic laudantium modi non minus provident necessitatibus at voluptatibus ipsa consequatur, 
      rem omnis et dolore maiores molestias!
    </main>
  );
}

export default App;
