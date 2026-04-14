import { useRef, useState, useEffect } from "react";
import io from "socket.io-client";
import "./Whiteboard.css";

const Whiteboard = () => {
  const canvasRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [socket, setSocket] = useState(null);
  const [users, setUsers] = useState({});
  const [userId, setUserId] = useState(null);
  const [roomId, setRoomId] = useState("default-room");
  const [connected, setConnected] = useState(false);
  const contextRef = useRef(null);

  // Color palette for users
  const colors = [
    "#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A", "#98D8C8",
    "#F7DC6F", "#BB8FCE", "#85C1E2", "#F8B88B", "#82E0AA"
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = window.innerWidth - 20;
    canvas.height = window.innerHeight - 100;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#000";
    contextRef.current = ctx;

    // Handle window resize
    const handleResize = () => {
      canvas.width = window.innerWidth - 20;
      canvas.height = window.innerHeight - 100;
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io("http://localhost:3001", {
      transports: ["websocket"],
      reconnection: true,
    });

    newSocket.on("connect", () => {
      console.log("Connected to server");
      setConnected(true);
      const id = newSocket.id;
      setUserId(id);
      newSocket.emit("join-room", { roomId, userId: id });
    });

    newSocket.on("user-joined", (data) => {
      console.log("User joined:", data);
      setUsers((prev) => ({
        ...prev,
        [data.userId]: { color: colors[Object.keys(prev).length % colors.length] },
      }));
    });

    newSocket.on("user-left", (data) => {
      setUsers((prev) => {
        const updated = { ...prev };
        delete updated[data.userId];
        return updated;
      });
    });

    newSocket.on("draw", (data) => {
      drawRemote(data);
    });

    newSocket.on("disconnect", () => {
      console.log("Disconnected from server");
      setConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [roomId]);

  const startDrawing = (e) => {
    if (!contextRef.current) return;
    const { offsetX, offsetY } = e.nativeEvent;
    contextRef.current.beginPath();
    contextRef.current.moveTo(offsetX, offsetY);
    setDrawing(true);

    socket?.emit("draw-start", {
      x: offsetX,
      y: offsetY,
      userId,
      color: users[userId]?.color || "#000",
    });
  };

  const draw = (e) => {
    if (!drawing || !contextRef.current) return;

    const { offsetX, offsetY } = e.nativeEvent;
    contextRef.current.lineTo(offsetX, offsetY);
    contextRef.current.stroke();

    socket?.emit("draw-line", {
      x: offsetX,
      y: offsetY,
      userId,
    });
  };

  const stopDrawing = () => {
    if (!contextRef.current) return;
    contextRef.current.closePath();
    setDrawing(false);
    socket?.emit("draw-end", { userId });
  };

  const drawRemote = (data) => {
    const ctx = contextRef.current;
    if (!ctx) return;

    if (data.type === "start") {
      ctx.beginPath();
      ctx.moveTo(data.x, data.y);
      ctx.strokeStyle = data.color || "#000";
    } else if (data.type === "line") {
      ctx.lineTo(data.x, data.y);
      ctx.stroke();
    } else if (data.type === "end") {
      ctx.closePath();
    }
  };

  const clearCanvas = () => {
    const ctx = contextRef.current;
    if (!ctx) return;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    socket?.emit("clear-canvas");
  };

  if (!connected) {
    return (
      <div className="whiteboard-container">
        <div className="connection-status">
          <p>Connecting to collaboration server...</p>
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="whiteboard-container">
      <div className="toolbar">
        <button onClick={clearCanvas} className="btn-clear">
          Clear Canvas
        </button>
        <div className="connection-info">
          <span className="status-badge connected">● Connected</span>
          <span className="user-count">Users: {Object.keys(users).length + 1}</span>
        </div>
      </div>
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        className="whiteboard-canvas"
      />
    </div>
  );
};

export default Whiteboard;