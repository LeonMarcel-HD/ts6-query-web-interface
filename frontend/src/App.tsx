import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import tsLogo from "./assets/teamspeak_blue.svg";
import { UserGroupIcon, PlayCircleIcon } from '@heroicons/react/24/solid';
import "./App.css";

interface TSClient {
  clid: string;
  cid: string;
  client_database_id: string;
  client_nickname: string;
  [key: string]: string;
}

interface ServerToClientEvents {
  log: (msg: string) => void;
  clients: (list: TSClient[]) => void;
  commandResult: (res: unknown) => void;
}

interface ClientToServerEvents {
  sendCommand: (cmd: string) => void;
}

const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
  import.meta.env.VITE_API_URL || "http://localhost:8080",
  { transports: ["websocket"] }
);

const tsLink = "https://tmspk.gg/Lw4wEIhC"; // replace with your ts link

function App() {
  const [clients, setClients] = useState<TSClient[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    socket.on("connect", () => console.log("✅ Socket connected"));
    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected");
      setError("🔴 Disconnected");
    });
    socket.on("connect_error", (err) => {
      console.error("⚠️ Socket error:", err);
      setError("🟠 Connection Error");
    });

    socket.on("clients", (list) => {
      if (!list) {
        setError("❌ Clientlist missing");
        return;
      }
      const filtered = list
        .filter(
          (c) =>
            c.client_type !== "1" &&
            c.client_nickname?.toLowerCase() !== "serveradmin"
        )
        .sort((a, b) =>
          a.client_nickname.localeCompare(b.client_nickname, "de")
        );
      setClients(filtered);
      setError(null);
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("connect_error");
      socket.off("clients");
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-base-200 text-base-content text-center px-4 py-10 dark">
      {/* Logo + Title */}
      <div className="flex flex-col items-center mb-8 space-y-3">
        <a
          href="https://www.teamspeak.com/en/downloads/"
          target="_blank"
          rel="noreferrer"
          className="inline-flex flex-col items-center"
        >
          <img
            src={tsLogo}
            className="w-20 h-20 object-contain transition-color duration-300 hover:scale-105 hover:drop-shadow-[0_0_2em_#646cffaa]"
            alt="TeamSpeak logo"
          />
          <h1 className="text-3xl font-bold mt-3 tracking-wide">
            TeamSpeak 6
          </h1>
        </a>
        {error && (
          <h2 className="text-error font-medium text-sm mt-2">{error}</h2>
        )}
      </div>

      {/* Card */}
      <div className="card w-full max-w-sm bg-base-100 shadow-xl rounded-xl p-6 flex flex-col items-center gap-4 bg-neutral-900">
        {/* user count button */}
        <button className="btn btn-primary w-full text-lg font-semibold flex items-center justify-center gap-2">
          <UserGroupIcon className="w-6 h-6" />
          <span>User Count: {clients.length}</span>
        </button>

        {/* join server card */}
        <a
          href={tsLink}
          target="_blank"
          rel="noreferrer"
          className="w-xs flex items-center justify-center gap-3 px-5 py-3 rounded-lg bg-blue-500 text-white font-semibold transition-all duration-300 hover:scale-[1.02]"
        >
          <PlayCircleIcon className="w-6 h-6" />
          <span>Join</span>
        </a>
      </div>

      {clients.length > 0 ? (
        <div className="mt-8 card w-full max-w-sm bg-base-100 shadow-xl rounded-xl p-6 flex flex-col items-center gap-4 bg-neutral-900">
          <div className="text-lg font-semibold mb-4">
            Connected Users
          </div>
          <table className="table w-full text-left text-sm text-gray-300">
            <tbody>
              {clients.map((client) => (
                <tr
                  key={client.clid}
                  className="hover:bg-neutral-800 transition-all duration-150"
                >
                  <td className="py-2 px-4 font-medium text-white">
                    {client.client_nickname}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="mt-8 text-gray-500 italic">No users connected.</div>
      )}

      {/* Footer */ /* you can keep it like it is if you want to give me some credits */}
      <footer className="mt-10 text-md text-gray-500">
        Made with ⁠♡ by <span className="text-primary font-semibold">JXCS</span> ×{" "}
        <span className="text-gray-400">React + HeroUI</span>
      </footer>
    </div>
  );
}

export default App;
