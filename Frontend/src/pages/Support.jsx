import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import {
  MessageSquare,
  Plus,
  Send,
  Shield,
  History,
  Sparkles,
  Clock,
  CheckCircle,
  XCircle,
  Menu,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/Dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { useUser } from "@/contexts/UserContextHook";
import Requests from "@/utils/Requests";
import getBaseUrl from "@/utils/GetBaseUrl";

// ── Palette ──────────────────────────────────────────────────────────
// bg:        #fbf1df  (warm cream — main background)
// surface:   #f2e8d0  (deeper parchment — sidebar, header panels)
// border:    #e2d3b4  (warm tan divider)
// muted:     #b8a07a  (mid warm brown — placeholders, metadata)
// subtle:    #8a6f4e  (deeper warm — secondary text)
// strong:    #4a2e0e  (dark walnut — body text)
// accent:    #3a4d39  (forest green — primary CTA, active states)
// accent-lt: #dce8dc  (light green tint — icon backgrounds, hover)
// accent-dk: #2a3a28  (deep green — hover on buttons)

const statusConfig = {
  open: {
    label: "Open",
    className: "bg-amber-100 text-amber-700 border border-amber-200",
    dot: "bg-amber-500",
  },
  "in-progress": {
    label: "In Review",
    className: "bg-violet-100 text-violet-700 border border-violet-200",
    dot: "bg-violet-500",
  },
  resolved: {
    label: "Resolved",
    className: "bg-emerald-100 text-emerald-700 border border-emerald-200",
    dot: "bg-emerald-500",
  },
  closed: {
    label: "Closed",
    className: "bg-stone-200 text-stone-500 border border-stone-300",
    dot: "bg-stone-400",
  },
};

const priorityConfig = {
  low: { label: "Low", color: "text-stone-400" },
  medium: { label: "Medium", color: "text-amber-600" },
  high: { label: "High", color: "text-orange-600" },
  urgent: { label: "Urgent", color: "text-red-600" },
};

function StatusBadge({ status }) {
  const cfg = statusConfig[status] || {
    label: status,
    className: "bg-stone-100 text-stone-500 border border-stone-200",
    dot: "bg-stone-400",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-[3px] rounded-full text-[10px] font-semibold tracking-wider uppercase flex-shrink-0 ${cfg.className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function TicketCard({ ticket, isSelected, onClick }) {
  const pri = priorityConfig[ticket.priority] || priorityConfig.medium;
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-5 py-4 border-b border-[#e2d3b4] transition-all duration-150 group relative ${
        isSelected ? "bg-[#fbf1df]" : "hover:bg-[#f5e9d4]"
      }`}
    >
      {isSelected && (
        <>
          <span className="absolute left-0 top-0 h-full w-[3px] bg-[#3a4d39] rounded-r-sm" />
          <span className="absolute inset-0 bg-gradient-to-r from-[#3a4d39]/5 to-transparent pointer-events-none" />
        </>
      )}
      <div className="flex items-start justify-between gap-2 mb-2">
        <p
          className={`text-[13px] font-semibold leading-snug truncate pr-1 transition-colors ${
            isSelected
              ? "text-[#3a4d39]"
              : "text-[#6b5237] group-hover:text-[#4a2e0e]"
          }`}
        >
          {ticket.subject}
        </p>
        <StatusBadge status={ticket.status} />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-[#b8a07a] font-mono tracking-wider">
          #{ticket.ticket_id.slice(-6).toUpperCase()}
        </span>
        <div className="flex items-center gap-1.5">
          <span className={`text-[10px] font-semibold ${pri.color}`}>
            {pri.label}
          </span>
          <span className="text-[#d4c4a0]">·</span>
          <span className="text-[10px] text-[#b8a07a]">
            {new Date(ticket.date_created).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>
      </div>
    </button>
  );
}

function MessageBubble({ msg, user, isInitial }) {
  const isMe = isInitial || msg.sender_type === "customer";
  return (
    <div className={`flex gap-3 ${isMe ? "" : "flex-row-reverse"} items-end`}>
      <div
        className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 ${
          isMe ? "bg-[#e2d3b4] text-[#7c5c38]" : "bg-[#3a4d39] text-[#fbf1df]"
        }`}
      >
        {isMe ? (
          (user?.first_name?.[0] ?? "U")
        ) : (
          <Shield className="w-3.5 h-3.5" />
        )}
      </div>
      <div
        className={`max-w-[76%] space-y-1 ${!isMe ? "items-end flex flex-col" : ""}`}
      >
        <div
          className={`px-4 py-3 text-[13px] leading-relaxed whitespace-pre-wrap ${
            isMe
              ? "bg-white border border-[#e2d3b4] text-[#4a2e0e] rounded-2xl rounded-bl-sm shadow-sm"
              : "bg-[#3a4d39] text-[#e8f2e8] rounded-2xl rounded-br-sm shadow-md shadow-[#3a4d39]/20"
          }`}
        >
          {isInitial ? msg.description : msg.message}
        </div>
        <span className="text-[10px] text-[#b8a07a] px-1">
          {isMe ? (isInitial ? "Original inquiry" : "You") : "Support Team"}
          {!isInitial && msg.date_sent && (
            <>
              {" "}
              ·{" "}
              {new Date(msg.date_sent).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </>
          )}
        </span>
      </div>
    </div>
  );
}

// Sidebar extracted so it renders in both desktop panel + mobile drawer
function SidebarContent({
  tickets,
  loading,
  selectedTicket,
  setSelectedTicket,
  setShowCreateDialog,
  onTicketClick,
}) {
  return (
    <>
      <div className="px-5 pt-6 pb-5 border-b border-[#e2d3b4] flex-shrink-0">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-mono text-[10px] font-medium tracking-[0.18em] text-[#b8a07a] uppercase mb-1.5">
              Support Center
            </p>
            <h1 className="text-[21px] font-semibold text-[#3a4d39] leading-tight tracking-tight">
              Your Tickets
            </h1>
            <p className="text-[11px] text-[#8a6f4e] mt-1">
              {tickets.length} {tickets.length === 1 ? "thread" : "threads"}
            </p>
          </div>
          <button
            className="mt-1 flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#3a4d39] hover:bg-[#2a3a28] text-[#fbf1df] text-[11px] font-semibold tracking-wide transition-all duration-150 active:scale-95 shadow-md shadow-[#3a4d39]/25"
            onClick={() => setShowCreateDialog(true)}
          >
            <Plus className="w-3.5 h-3.5" />
            New
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-warm">
        {loading ? (
          <div className="px-5 py-6 space-y-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2.5">
                <div className="skel h-3 w-3/4" />
                <div className="skel h-2.5 w-2/5" />
              </div>
            ))}
          </div>
        ) : tickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full pb-20 px-8 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#dce8dc] flex items-center justify-center mb-3">
              <MessageSquare className="w-5 h-5 text-[#3a4d39]" />
            </div>
            <p className="text-[14px] font-semibold text-[#6b5237]">
              No tickets yet
            </p>
            <p className="text-[12px] text-[#b8a07a] mt-0.5">
              Create one to get started
            </p>
          </div>
        ) : (
          tickets.map((ticket) => (
            <TicketCard
              key={ticket.ticket_id}
              ticket={ticket}
              isSelected={selectedTicket?.ticket_id === ticket.ticket_id}
              onClick={() => {
                setSelectedTicket(ticket);
                onTicketClick?.();
              }}
            />
          ))
        )}
      </div>
    </>
  );
}

export default function Support() {
  const { user } = useUser();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newTicket, setNewTicket] = useState({
    subject: "",
    description: "",
    priority: "medium",
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const scrollRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    if (user?.customer_id) fetchTickets();
  }, [user]);

  useEffect(() => {
    if (scrollRef.current)
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  async function fetchTickets() {
    setLoading(true);
    try {
      const res = await Requests({
        url: `/support/tickets/customer/${user.customer_id}`,
      });
      if (res?.data) {
        setTickets(res.data);
        if (res.data.length > 0 && !selectedTicket)
          setSelectedTicket(res.data[0]);
      }
    } catch {
      toast.error("Failed to load tickets");
    } finally {
      setLoading(false);
    }
  }

  async function fetchMessages(ticketId) {
    setMessagesLoading(true);
    try {
      const res = await Requests({
        url: `/support/tickets/${ticketId}/messages/customer/${user.customer_id}`,
      });
      if (res?.data) setMessages(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setMessagesLoading(false);
    }
  }

  const handleCreateTicket = async () => {
    if (!newTicket.subject || !newTicket.description)
      return toast.error("Please fill in all required fields");
    setCreateLoading(true);
    try {
      const res = await Requests({
        url: "/support/tickets",
        method: "POST",
        data: { ...newTicket, customerId: user.customer_id },
      });
      if (res?.data) {
        toast.success("Ticket created successfully");
        setShowCreateDialog(false);
        setNewTicket({ subject: "", description: "", priority: "medium" });
        fetchTickets();
      }
    } catch {
      toast.error("Failed to create ticket");
    } finally {
      setCreateLoading(false);
    }
  };

  // Socket setup
  useEffect(() => {
    const baseUrl = getBaseUrl();
    socketRef.current = io(baseUrl, { transports: ["websocket"] });
    socketRef.current.on("connect", () =>
      console.log("Connected to Support WS"),
    );

    socketRef.current.on("new_message_received", (newMessage) => {
      setMessages((prev) => {
        if (prev.find((m) => m.message_id === newMessage.message_id))
          return prev;
        return [...prev, newMessage];
      });
    });

    socketRef.current.on("ticket_status_updated", (updatedTicket) => {
      setTickets((prev) =>
        prev.map((t) =>
          t.ticket_id === updatedTicket.ticket_id ? updatedTicket : t,
        ),
      );
      setSelectedTicket((current) =>
        current?.ticket_id === updatedTicket.ticket_id
          ? updatedTicket
          : current,
      );
      if (updatedTicket.status === "closed")
        toast.info("This ticket has been marked as closed.");
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  // Join ticket room on selection
  useEffect(() => {
    if (selectedTicket && socketRef.current) {
      socketRef.current.emit("joinTicket", {
        ticketId: selectedTicket.ticket_id,
      });
      fetchMessages(selectedTicket.ticket_id);
    }
  }, [selectedTicket]);

  const handleSendMessage = async () => {
    if (!replyText.trim() || !selectedTicket) return;
    const optimisticId = `temp-${Date.now()}`;
    const optimistic = {
      message_id: optimisticId,
      sender_type: "customer",
      message: replyText,
      date_sent: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    setReplyText("");
    try {
      const res = await Requests({
        url: `/support/tickets/${selectedTicket.ticket_id}/messages`,
        method: "POST",
        data: { senderId: user.customer_id, message: optimistic.message },
      });
      if (res?.data)
        setMessages((prev) =>
          prev.map((m) => (m.message_id === optimisticId ? res.data : m)),
        );
    } catch {
      toast.error("Failed to send message");
      setMessages((prev) => prev.filter((m) => m.message_id !== optimisticId));
    }
  };

  const isClosed = selectedTicket?.status === "closed";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&family=Geist+Mono:wght@400;500&display=swap');

        .support-root * { font-family: 'Geist', -apple-system, BlinkMacSystemFont, sans-serif; }
        .mono { font-family: 'Geist Mono', ui-monospace, monospace !important; }

        .scrollbar-warm::-webkit-scrollbar       { width: 4px; }
        .scrollbar-warm::-webkit-scrollbar-track  { background: transparent; }
        .scrollbar-warm::-webkit-scrollbar-thumb  { background: #d4c4a0; border-radius: 99px; }
        .scrollbar-warm::-webkit-scrollbar-thumb:hover { background: #b8a07a; }

        .chat-input { caret-color: #3a4d39; }
        .chat-input:focus { outline: none; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .msg-enter { animation: fadeUp 0.22s cubic-bezier(0.22,1,0.36,1) forwards; }

        @keyframes pulse-warm {
          0%, 100% { opacity: 0.4; transform: translateY(0); }
          50%       { opacity: 1;   transform: translateY(-3px); }
        }
        .dot-bounce { animation: pulse-warm 1.1s ease-in-out infinite; }

        .skel {
          background: linear-gradient(90deg, #e2d3b4 0%, #eddfc8 50%, #e2d3b4 100%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 4px;
        }
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

        /* Mobile drawer */
        .drawer-overlay {
          position: fixed; inset: 0; z-index: 40;
          background: rgba(58,77,57,0.3);
          backdrop-filter: blur(2px);
          animation: overlayIn 0.18s ease;
        }
        .drawer-panel {
          position: fixed; top: 0; left: 0; bottom: 0; z-index: 50;
          width: min(300px, 88vw);
          display: flex; flex-direction: column;
          background: #f2e8d0;
          border-right: 1px solid #e2d3b4;
          box-shadow: 6px 0 32px rgba(58,77,57,0.14);
          animation: drawerIn 0.22s cubic-bezier(0.22,1,0.36,1);
        }
        @keyframes overlayIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes drawerIn  { from { transform: translateX(-100%); } to { transform: translateX(0); } }

        [data-radix-dialog-overlay] { background: rgba(58,77,57,0.2) !important; backdrop-filter: blur(3px); }
      `}</style>

      <div
        className="support-root flex w-full h-[calc(100vh-80px)] overflow-hidden"
        style={{ background: "#fbf1df" }}
      >
        {/* ── DESKTOP SIDEBAR ─────────────────────────────────── */}
        <div
          className="hidden md:flex w-[300px] flex-shrink-0 border-r border-[#e2d3b4] flex-col"
          style={{ background: "#f2e8d0" }}
        >
          <SidebarContent
            tickets={tickets}
            loading={loading}
            selectedTicket={selectedTicket}
            setSelectedTicket={setSelectedTicket}
            setShowCreateDialog={setShowCreateDialog}
          />
        </div>

        {/* ── MOBILE DRAWER ───────────────────────────────────── */}
        {sidebarOpen && (
          <>
            <div
              className="drawer-overlay md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="drawer-panel md:hidden">
              <button
                className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-[#dce8dc] text-[#3a4d39] flex items-center justify-center hover:bg-[#c4d8c4] transition-colors z-10"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="w-4 h-4" />
              </button>
              <SidebarContent
                tickets={tickets}
                loading={loading}
                selectedTicket={selectedTicket}
                setSelectedTicket={setSelectedTicket}
                setShowCreateDialog={setShowCreateDialog}
                onTicketClick={() => setSidebarOpen(false)}
              />
            </div>
          </>
        )}

        {/* ── CHAT PANEL ──────────────────────────────────────── */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {selectedTicket ? (
            <>
              {/* Chat header */}
              <div
                className="flex-shrink-0 flex items-center justify-between px-4 md:px-7 py-3.5 md:py-4 border-b border-[#e2d3b4]"
                style={{ background: "#f2e8d0" }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Mobile hamburger */}
                  <button
                    className="md:hidden flex-shrink-0 w-8 h-8 rounded-lg bg-[#dce8dc] text-[#3a4d39] flex items-center justify-center hover:bg-[#c4d8c4] transition-colors"
                    onClick={() => setSidebarOpen(true)}
                    aria-label="Open ticket list"
                  >
                    <Menu className="w-4 h-4" />
                  </button>

                  <div className="flex-shrink-0 w-8 h-8 md:w-9 md:h-9 rounded-xl bg-[#dce8dc] flex items-center justify-center">
                    <MessageSquare className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#3a4d39]" />
                  </div>

                  <div className="min-w-0">
                    <h2 className="text-[14px] md:text-[15px] font-semibold text-[#3a4d39] truncate leading-tight">
                      {selectedTicket.subject}
                    </h2>
                    <div className="flex items-center gap-1.5 md:gap-2 mt-0.5">
                      <StatusBadge status={selectedTicket.status} />
                      <span className="text-[#d4c4a0] hidden sm:inline">·</span>
                      <span
                        className={`mono text-[10px] font-medium tracking-wider uppercase hidden sm:inline ${priorityConfig[selectedTicket.priority]?.color}`}
                      >
                        {priorityConfig[selectedTicket.priority]?.label}
                      </span>
                      <span className="text-[#d4c4a0] hidden md:inline">·</span>
                      <span className="mono text-[10px] text-[#b8a07a] tracking-wider hidden md:inline">
                        #{selectedTicket.ticket_id.slice(-6).toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mono text-[10px] md:text-[11px] text-[#b8a07a] flex-shrink-0 ml-2 md:ml-4 hidden sm:block">
                  {new Date(selectedTicket.date_created).toLocaleDateString(
                    "en-US",
                    { month: "short", day: "numeric", year: "numeric" },
                  )}
                </div>
              </div>

              {/* Messages */}
              <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto scrollbar-warm px-4 md:px-7 py-5 md:py-7 space-y-4 md:space-y-5"
                style={{ background: "#fbf1df" }}
              >
                <div className="msg-enter">
                  <MessageBubble
                    msg={selectedTicket}
                    user={user}
                    isInitial={true}
                  />
                </div>

                {messagesLoading ? (
                  <div className="flex items-center gap-1.5 py-4 pl-11">
                    {[0, 0.14, 0.28].map((d, i) => (
                      <span
                        key={i}
                        className="w-2 h-2 bg-[#3a4d39]/40 rounded-full dot-bounce"
                        style={{ animationDelay: `${d}s` }}
                      />
                    ))}
                  </div>
                ) : (
                  messages.map((msg, idx) => (
                    <div key={msg.message_id || idx} className="msg-enter">
                      <MessageBubble msg={msg} user={user} isInitial={false} />
                    </div>
                  ))
                )}
              </div>

              {/* Reply area */}
              <div
                className="flex-shrink-0 px-4 md:px-7 py-4 md:py-5 border-t border-[#e2d3b4]"
                style={{ background: "#f2e8d0" }}
              >
                {isClosed ? (
                  <div className="flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#e2d3b4] border border-[#d4c4a0]">
                    <XCircle className="w-4 h-4 text-[#b8a07a]" />
                    <span className="text-[12px] text-[#8a6f4e] font-medium">
                      This ticket has been closed
                    </span>
                  </div>
                ) : (
                  <>
                    <div className="flex items-end gap-3 rounded-xl border border-[#e2d3b4] bg-white px-4 pt-3 pb-3 shadow-sm transition-all duration-200 focus-within:border-[#3a4d39] focus-within:shadow-[0_0_0_3px_rgba(58,77,57,0.08)]">
                      <textarea
                        placeholder="Write a message…"
                        className="chat-input flex-1 border-none bg-transparent p-0 min-h-[52px] md:min-h-[56px] max-h-[120px] resize-none text-[13px] text-[#4a2e0e] placeholder:text-[#c4aa82] focus-visible:ring-0 shadow-none outline-none leading-relaxed"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={!replyText.trim()}
                        className="flex-shrink-0 mb-0.5 w-9 h-9 rounded-xl bg-[#3a4d39] hover:bg-[#2a3a28] disabled:bg-[#e2d3b4] disabled:cursor-not-allowed text-[#fbf1df] disabled:text-[#b8a07a] flex items-center justify-center transition-all duration-150 active:scale-90 shadow-sm shadow-[#3a4d39]/20"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="mono text-center text-[10px] text-[#b8a07a] mt-2.5 tracking-wide hidden sm:block">
                      ↵ Enter to send · ⇧ Shift+Enter for new line
                    </p>
                  </>
                )}
              </div>
            </>
          ) : (
            /* Empty state */
            <div
              className="flex-1 flex flex-col items-center justify-center px-6"
              style={{ background: "#fbf1df" }}
            >
              <div className="text-center max-w-[280px]">
                <div className="w-16 h-16 rounded-3xl bg-[#dce8dc] border border-[#c4d8c4] flex items-center justify-center mx-auto mb-5">
                  <History className="w-6 h-6 text-[#3a4d39]" />
                </div>
                <h3 className="text-[20px] font-semibold text-[#3a4d39] mb-2 tracking-tight">
                  No ticket selected
                </h3>
                <p className="text-[13px] text-[#8a6f4e] leading-relaxed">
                  Choose a ticket from the sidebar, or open a new one to get
                  help from our team.
                </p>
                <div className="flex flex-col sm:flex-row items-center gap-2.5 justify-center mt-5">
                  <button
                    className="md:hidden w-full sm:w-auto flex items-center gap-2 justify-center px-4 py-2.5 rounded-xl border border-[#3a4d39] text-[#3a4d39] text-[12px] font-semibold hover:bg-[#dce8dc] transition-colors active:scale-95"
                    onClick={() => setSidebarOpen(true)}
                  >
                    <Menu className="w-4 h-4" />
                    View Tickets
                  </button>
                  <button
                    className="w-full sm:w-auto flex items-center gap-2 justify-center px-4 py-2.5 rounded-xl bg-[#3a4d39] text-[#fbf1df] text-[12px] font-semibold hover:bg-[#2a3a28] transition-colors shadow-md shadow-[#3a4d39]/20 active:scale-95"
                    onClick={() => setShowCreateDialog(true)}
                  >
                    <Plus className="w-4 h-4" />
                    Open a ticket
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Create Ticket Dialog ─────────────────────────────── */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent
          className="w-[calc(100vw-32px)] sm:max-w-[460px] p-0 overflow-hidden border border-[#e2d3b4] rounded-2xl shadow-2xl shadow-[#3a4d39]/10"
          style={{ background: "#fbf1df" }}
        >
          {/* Green + warm gradient accent bar */}
          <div className="h-[3px] w-full bg-gradient-to-r from-[#b8a07a] via-[#3a4d39] to-[#b8a07a]" />
          <div className="p-5 sm:p-7">
            <div className="flex items-center gap-3 mb-5 sm:mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#dce8dc] flex items-center justify-center flex-shrink-0">
                <MessageSquare className="w-5 h-5 text-[#3a4d39]" />
              </div>
              <div>
                <DialogTitle className="text-[16px] sm:text-[17px] font-semibold text-[#3a4d39] leading-tight">
                  New support ticket
                </DialogTitle>
                <DialogDescription className="text-[12px] text-[#8a6f4e] mt-0.5">
                  We typically respond within 24 hours
                </DialogDescription>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="mono text-[10px] font-medium text-[#8a6f4e] uppercase tracking-[0.12em]">
                  Subject
                </label>
                <input
                  placeholder="Brief summary of your issue"
                  className="w-full rounded-xl border border-[#e2d3b4] bg-white focus:border-[#3a4d39] focus:ring-2 focus:ring-[#3a4d39]/10 text-[13px] text-[#4a2e0e] placeholder:text-[#b8a07a] px-3.5 py-2.5 transition-all outline-none shadow-sm"
                  value={newTicket.subject}
                  onChange={(e) =>
                    setNewTicket({ ...newTicket, subject: e.target.value })
                  }
                />
              </div>

              <div className="space-y-1.5">
                <label className="mono text-[10px] font-medium text-[#8a6f4e] uppercase tracking-[0.12em]">
                  Description
                </label>
                <textarea
                  placeholder="Describe your issue in detail…"
                  rows={4}
                  className="w-full rounded-xl border border-[#e2d3b4] bg-white focus:border-[#3a4d39] focus:ring-2 focus:ring-[#3a4d39]/10 text-[13px] text-[#4a2e0e] placeholder:text-[#b8a07a] px-3.5 py-2.5 transition-all outline-none resize-none shadow-sm"
                  value={newTicket.description}
                  onChange={(e) =>
                    setNewTicket({ ...newTicket, description: e.target.value })
                  }
                />
              </div>

              <div className="space-y-1.5">
                <label className="mono text-[10px] font-medium text-[#8a6f4e] uppercase tracking-[0.12em]">
                  Priority
                </label>
                <Select
                  value={newTicket.priority}
                  onValueChange={(v) =>
                    setNewTicket({ ...newTicket, priority: v })
                  }
                >
                  <SelectTrigger className="rounded-xl border-[#e2d3b4] bg-white text-[13px] text-[#4a2e0e] shadow-sm">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent
                    className="rounded-xl border-[#e2d3b4] shadow-xl text-[13px]"
                    style={{ background: "#fbf1df" }}
                  >
                    {Object.entries(priorityConfig).map(([key, p]) => (
                      <SelectItem
                        key={key}
                        value={key}
                        className="focus:bg-[#eee5d0]"
                      >
                        <span className={`font-semibold ${p.color}`}>
                          {p.label}
                        </span>
                        <span className="text-[#8a6f4e] ml-1.5">
                          —{" "}
                          {
                            {
                              low: "minor / feedback",
                              medium: "general inquiry",
                              high: "critical issue",
                              urgent: "emergency",
                            }[key]
                          }
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-5 sm:mt-6 flex gap-2.5">
              <button
                className="flex-1 py-2.5 rounded-xl border border-[#e2d3b4] text-[12px] font-semibold text-[#8a6f4e] hover:bg-[#eddfc8] transition-colors"
                onClick={() => setShowCreateDialog(false)}
              >
                Cancel
              </button>
              <button
                className="flex-1 py-2.5 rounded-xl bg-[#3a4d39] hover:bg-[#2a3a28] text-[#fbf1df] text-[12px] font-semibold tracking-wide transition-all shadow-md shadow-[#3a4d39]/20 disabled:opacity-50 active:scale-[0.98]"
                onClick={handleCreateTicket}
                disabled={createLoading}
              >
                {createLoading ? "Submitting…" : "Submit Ticket"}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
