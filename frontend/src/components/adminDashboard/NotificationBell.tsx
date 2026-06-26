import { useEffect, useRef, useState } from "react";
import { FaBell, FaCheckDouble } from "react-icons/fa";

const API_BASE = "http://localhost:8000";

interface Notif {
  id: number;
  type: string;
  title: string;
  message: string;
  data: { internship_id?: number } | null;
  read_at: string | null;
  created_at: string;
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [unread, setUnread] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  const fetchNotifs = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const d = await res.json();
        setNotifs(Array.isArray(d.notifications) ? d.notifications : []);
        setUnread(d.unread_count || 0);
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  useEffect(() => {
    fetchNotifs();
    const t = setInterval(fetchNotifs, 60000); // refresh every minute
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const markRead = async (id: number) => {
    const token = localStorage.getItem("token");
    try {
      await fetch(`${API_BASE}/api/notifications/${id}/read`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n)));
      setUnread((u) => Math.max(0, u - 1));
    } catch (err) {
      console.error("Error marking notification read:", err);
    }
  };

  const markAll = async () => {
    const token = localStorage.getItem("token");
    try {
      await fetch(`${API_BASE}/api/notifications/read-all`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifs((prev) => prev.map((n) => ({ ...n, read_at: n.read_at || new Date().toISOString() })));
      setUnread(0);
    } catch (err) {
      console.error("Error marking all read:", err);
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative w-11 h-11 bg-white rounded-xl shadow-sm flex items-center justify-center hover:bg-gray-50 transition"
        aria-label="Notifications"
      >
        <FaBell className="text-gray-600" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <span className="font-semibold text-gray-800">Notifications</span>
            {unread > 0 && (
              <button onClick={markAll} className="text-xs text-green-600 hover:underline flex items-center gap-1">
                <FaCheckDouble /> Tout marquer lu
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-auto">
            {notifs.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-gray-400">Aucune notification</p>
            ) : (
              notifs.map((n) => (
                <button
                  key={n.id}
                  onClick={() => !n.read_at && markRead(n.id)}
                  className={`w-full text-left px-4 py-3 border-b last:border-0 hover:bg-gray-50 transition ${
                    n.read_at ? "" : "bg-green-50/50"
                  }`}
                >
                  <div className="flex justify-between gap-2">
                    <span className="text-sm font-medium text-gray-800">{n.title}</span>
                    {!n.read_at && <span className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0" />}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{n.message}</p>
                  <p className="text-[10px] text-gray-400 mt-1">
                    {new Date(n.created_at).toLocaleString("fr-FR")}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}