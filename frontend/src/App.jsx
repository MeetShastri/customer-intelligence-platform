import { useEffect } from "react";
import socket from "./sockets/socket";

function App() {

  useEffect(() => {

    socket.on("connect", () => {
      console.log("Connected to socket server");
      console.log("Socket ID:", socket.id);
    });

    return () => {
      socket.off("connect");
    };

  }, []);

  return (
    <div>
      <h1>Customer Intelligence Platform</h1>
    </div>
  );
}

export default App;