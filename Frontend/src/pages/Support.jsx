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
  AlertCircle,
  Info,
  LifeBuoy,
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
import { motion as Motion, AnimatePresence } from "framer-motion";

// Status & Priority Configuration
const statusConfig = {
  open: {
    label: "Open",
    className: "bg-amber-100 text-amber-700 border-2 border-amber-200",
    dot: "bg-amber-500",
  },
  "in-progress": {
    label: "In Review",
    className: "bg-violet-100 text-violet-700 border-2 border-violet-200",
    dot: "bg-violet-500",
  },
  resolved: {
    label: "Resolved",
    className: "bg-emerald-100 text-emerald-700 border-2 border-emerald-200",
    dot: "bg-emerald-500",
  },
  closed: {
    label: "Closed",
    className: "bg-stone-200 text-stone-600 border-2 border-stone-300",
    dot: "bg-stone-400",
  },
};

const priorityConfig = {
  low: { label: "Low", color: "text-stone-500", icon: Info },
  medium: { label: "Medium", color: "text-amber-600", icon: AlertCircle },
  high: { label: "High", color: "text-orange-600", icon: AlertCircle },
  urgent: { label: "Urgent", color: "text-red-600", icon: AlertCircle },
};

function StatusBadge({ status }) {
  const cfg = statusConfig[status] || {
    label: status,
    className: "bg-stone-100 text-stone-500 border-2 border-stone-200",
    dot: "bg-stone-400",
  };
  return (
    <span
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-xl text-[10px] font-bold tracking-wider uppercase flex-shrink-0 ${cfg.className}`}
    >
      <span
        className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot} animate-pulse`}
      />
      {cfg.label}
    </span>
  );
}

function TicketCard({ ticket, isSelected, onClick }) {
  const pri = priorityConfig[ticket.priority] || priorityConfig.medium;
  const PriorityIcon = pri.icon;

  return (
    <Motion.button
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      onClick={onClick}
      className={`w-full text-left px-5 py-4 border-b-2 border-[#e2d3b4] transition-all duration-200 group relative ${
        isSelected
          ? "bg-gradient-to-r from-[#3a4d39]/5 to-transparent"
          : "hover:bg-[#f5e9d4]"
      }`}
    >
      {isSelected && (
        <Motion.span
          layoutId="selectedIndicator"
          className="absolute left-0 top-0 h-full w-1 bg-[#3a4d39] rounded-r-lg shadow-lg"
        />
      )}

      <div className="flex items-start justify-between gap-3 mb-2.5">
        <p
          className={`text-sm font-bold leading-snug pr-1 transition-colors ${
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
        <span className="text-[10px] text-[#b8a07a] font-mono tracking-wider font-bold bg-[#eddfc8] px-2 py-1 rounded-md">
          #{ticket.ticket_id.slice(-6).toUpperCase()}
        </span>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <PriorityIcon className={`w-3 h-3 ${pri.color}`} />
            <span className={`text-[10px] font-bold ${pri.color}`}>
              {pri.label}
            </span>
          </div>
          <span className="text-[#d4c4a0]">·</span>
          <span className="text-[10px] text-[#b8a07a] font-medium">
            {new Date(ticket.date_created).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>
      </div>
    </Motion.button>
  );
}

function MessageBubble({ msg, user, isInitial }) {
  const isMe = isInitial || msg.sender_type === "customer";

  return (
    <Motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-3 ${isMe ? "flex-row-reverse" : ""} items-end`}
    >
      {/* Avatar */}
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 shadow-md ${
          isMe
            ? "bg-gradient-to-br from-[#3a4d39] to-[#2a3a28] text-white"
            : "bg-gradient-to-br from-[#e2d3b4] to-[#d4c4a0] text-[#7c5c38]"
        }`}
      >
        {isMe ? (user?.first_name?.[0] ?? "U") : <Shield className="w-4 h-4" />}
      </div>

      {/* Bubble + label */}
      <div
        className={`max-w-[76%] space-y-1.5 ${isMe ? "items-end flex flex-col" : ""}`}
      >
        <div
          className={`px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
            isMe
              ? "bg-gradient-to-br from-[#3a4d39] to-[#2a3a28] text-white rounded-2xl rounded-br-md shadow-lg"
              : "bg-white border-2 border-[#e2d3b4] text-[#4a2e0e] rounded-2xl rounded-bl-md shadow-md"
          }`}
        >
          {isInitial ? msg.description : msg.message}
        </div>
        <div className="flex items-center gap-1.5 px-1">
          <span className="text-[10px] text-[#b8a07a] font-bold">
            {isMe ? (isInitial ? "Original Inquiry" : "You") : "Support Team"}
          </span>
          {!isInitial && msg.date_sent && (
            <>
              <span className="text-[#d4c4a0]">·</span>
              <span className="text-[10px] text-[#b8a07a]">
                {new Date(msg.date_sent).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </>
          )}
        </div>
      </div>
    </Motion.div>
  );
}

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
      <div className="px-5 pt-6 pb-5 border-b-2 border-[#e2d3b4] flex-shrink-0 bg-gradient-to-b from-[#f5ead5] to-[#f2e8d0]">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <LifeBuoy className="w-4 h-4 text-[#3a4d39]" />
              <p className="font-mono text-[10px] font-bold tracking-widest text-[#b8a07a] uppercase">
                Support Center
              </p>
            </div>
            <h1 className="text-2xl font-black text-[#3a4d39] leading-tight tracking-tight">
              Your Tickets
            </h1>
            <p className="text-xs text-[#8a6f4e] mt-1 font-medium">
              {tickets.length} active{" "}
              {tickets.length === 1 ? "conversation" : "conversations"}
            </p>
          </div>
          <button
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#3a4d39] hover:bg-[#2a3a28] text-white text-xs font-bold tracking-wide transition-all duration-200 active:scale-95 shadow-lg shadow-[#3a4d39]/25"
            onClick={() => setShowCreateDialog(true)}
          >
            <Plus className="w-4 h-4" />
            New
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-warm">
        {loading ? (
          <div className="px-5 py-6 space-y-5">
            {[1, 2, 3].map((i) => (
              <Motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                className="space-y-2.5"
              >
                <div className="skel h-4 w-3/4" />
                <div className="skel h-3 w-2/5" />
              </Motion.div>
            ))}
          </div>
        ) : tickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full pb-20 px-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#dce8dc] border-2 border-[#c4d8c4] flex items-center justify-center mb-4">
              <MessageSquare className="w-7 h-7 text-[#3a4d39]" />
            </div>
            <p className="text-base font-bold text-[#6b5237] mb-1">
              No tickets yet
            </p>
            <p className="text-xs text-[#b8a07a]">
              Create one to get started with support
            </p>
          </div>
        ) : (
          <AnimatePresence>
            {tickets.map((ticket) => (
              <TicketCard
                key={ticket.ticket_id}
                ticket={ticket}
                isSelected={selectedTicket?.ticket_id === ticket.ticket_id}
                onClick={() => {
                  setSelectedTicket(ticket);
                  onTicketClick?.();
                }}
              />
            ))}
          </AnimatePresence>
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
        @import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700;800&family=Geist+Mono:wght@400;500;600&display=swap');

        .support-root * { font-family: 'Geist', -apple-system, BlinkMacSystemFont, sans-serif; }
        .mono { font-family: 'Geist Mono', ui-monospace, monospace !important; }

        .scrollbar-warm::-webkit-scrollbar { width: 6px; }
        .scrollbar-warm::-webkit-scrollbar-track { background: transparent; }
        .scrollbar-warm::-webkit-scrollbar-thumb { background: #d4c4a0; border-radius: 99px; }
        .scrollbar-warm::-webkit-scrollbar-thumb:hover { background: #b8a07a; }

        .chat-input { caret-color: #3a4d39; }
        .chat-input:focus { outline: none; }

        .skel {
          background: linear-gradient(90deg, #e2d3b4 0%, #eddfc8 50%, #e2d3b4 100%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 6px;
        }
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

        .drawer-overlay {
          position: fixed; inset: 0; z-index: 40;
          background: rgba(58,77,57,0.4);
          backdrop-filter: blur(4px);
          animation: overlayIn 0.2s ease;
        }
        .drawer-panel {
          position: fixed; top: 0; left: 0; bottom: 0; z-index: 50;
          width: min(320px, 90vw);
          display: flex; flex-direction: column;
          background: #f2e8d0;
          border-right: 2px solid #e2d3b4;
          box-shadow: 8px 0 32px rgba(58,77,57,0.15);
          animation: drawerIn 0.25s cubic-bezier(0.22,1,0.36,1);
        }
        @keyframes overlayIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes drawerIn { from { transform: translateX(-100%); } to { transform: translateX(0); } }
      `}</style>

      <div
        className="support-root flex w-full h-[calc(100vh-80px)] overflow-hidden"
        style={{ background: "#fbf1df" }}
      >
        {/* Desktop Sidebar */}
        <div
          className="hidden md:flex w-[320px] flex-shrink-0 border-r-2 border-[#e2d3b4] flex-col shadow-xl"
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

        {/* Mobile Drawer */}
        <AnimatePresence>
          {sidebarOpen && (
            <>
              <Motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="drawer-overlay md:hidden"
                onClick={() => setSidebarOpen(false)}
              />
              <Motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="drawer-panel md:hidden"
              >
                <button
                  className="absolute top-4 right-4 w-9 h-9 rounded-xl bg-[#dce8dc] text-[#3a4d39] flex items-center justify-center hover:bg-[#c4d8c4] transition-colors z-10 shadow-md"
                  onClick={() => setSidebarOpen(false)}
                >
                  <X className="w-5 h-5" />
                </button>
                <SidebarContent
                  tickets={tickets}
                  loading={loading}
                  selectedTicket={selectedTicket}
                  setSelectedTicket={setSelectedTicket}
                  setShowCreateDialog={setShowCreateDialog}
                  onTicketClick={() => setSidebarOpen(false)}
                />
              </Motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Chat Panel */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {selectedTicket ? (
            <>
              {/* Chat Header */}
              <div
                className="flex-shrink-0 flex items-center justify-between px-4 md:px-7 py-4 md:py-5 border-b-2 border-[#e2d3b4] shadow-sm"
                style={{ background: "#f2e8d0" }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    className="md:hidden flex-shrink-0 w-10 h-10 rounded-xl bg-[#dce8dc] text-[#3a4d39] flex items-center justify-center hover:bg-[#c4d8c4] transition-colors shadow-md"
                    onClick={() => setSidebarOpen(true)}
                  >
                    <Menu className="w-5 h-5" />
                  </button>

                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-[#dce8dc] to-[#c4d8c4] flex items-center justify-center shadow-md">
                    <MessageSquare className="w-5 h-5 text-[#3a4d39]" />
                  </div>

                  <div className="min-w-0">
                    <h2 className="text-base md:text-lg font-bold text-[#3a4d39] truncate leading-tight">
                      {selectedTicket.subject}
                    </h2>
                    <div className="flex items-center gap-2 mt-1">
                      <StatusBadge status={selectedTicket.status} />
                      <span className="text-[#d4c4a0] hidden sm:inline">·</span>
                      <span
                        className={`mono text-[10px] font-bold tracking-wider uppercase hidden sm:inline ${priorityConfig[selectedTicket.priority]?.color}`}
                      >
                        {priorityConfig[selectedTicket.priority]?.label}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mono text-xs text-[#b8a07a] flex-shrink-0 ml-2 md:ml-4 hidden sm:flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-[#e2d3b4]">
                  <Clock className="w-3.5 h-3.5" />
                  {new Date(selectedTicket.date_created).toLocaleDateString(
                    "en-US",
                    { month: "short", day: "numeric", year: "numeric" },
                  )}
                </div>
              </div>

              {/* Messages */}
              <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto scrollbar-warm px-4 md:px-7 py-6 md:py-8 space-y-5"
                style={{ background: "#fbf1df" }}
              >
                <MessageBubble
                  msg={selectedTicket}
                  user={user}
                  isInitial={true}
                />

                {messagesLoading ? (
                  <div className="flex items-center gap-2 py-6 pl-11">
                    {[0, 0.14, 0.28].map((d, i) => (
                      <Motion.span
                        key={i}
                        animate={{ scale: [1, 1.2, 1], opacity: [0.4, 1, 0.4] }}
                        transition={{
                          repeat: Infinity,
                          duration: 1.2,
                          delay: d,
                          ease: "easeInOut",
                        }}
                        className="w-2.5 h-2.5 bg-[#3a4d39] rounded-full"
                      />
                    ))}
                  </div>
                ) : (
                  messages.map((msg) => (
                    <MessageBubble
                      key={msg.message_id}
                      msg={msg}
                      user={user}
                      isInitial={false}
                    />
                  ))
                )}
              </div>

              {/* Reply Area */}
              <div
                className="flex-shrink-0 px-4 md:px-7 py-5 md:py-6 border-t-2 border-[#e2d3b4] shadow-inner"
                style={{ background: "#f2e8d0" }}
              >
                {isClosed ? (
                  <div className="flex items-center justify-center gap-2.5 py-4 rounded-xl bg-gradient-to-r from-[#e2d3b4] to-[#d4c4a0] border-2 border-[#d4c4a0]">
                    <XCircle className="w-5 h-5 text-[#8a6f4e]" />
                    <span className="text-sm text-[#6b5237] font-bold">
                      This ticket has been closed
                    </span>
                  </div>
                ) : (
                  <>
                    <div className="flex items-end gap-3 rounded-2xl border-2 border-[#e2d3b4] bg-white px-4 pt-3 pb-3 shadow-md transition-all duration-200 focus-within:border-[#3a4d39] focus-within:shadow-lg focus-within:shadow-[#3a4d39]/10">
                      <textarea
                        placeholder="Write your message…"
                        className="chat-input flex-1 border-none bg-transparent p-0 min-h-[60px] max-h-[140px] resize-none text-sm text-[#4a2e0e] placeholder:text-[#c4aa82] focus-visible:ring-0 shadow-none outline-none leading-relaxed"
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
                        className="flex-shrink-0 mb-1 w-10 h-10 rounded-xl bg-[#3a4d39] hover:bg-[#2a3a28] disabled:bg-[#e2d3b4] disabled:cursor-not-allowed text-white disabled:text-[#b8a07a] flex items-center justify-center transition-all duration-200 active:scale-90 shadow-lg shadow-[#3a4d39]/25"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="mono text-center text-[10px] text-[#b8a07a] mt-3 tracking-wide hidden sm:block font-medium">
                      Press <span className="font-bold">Enter</span> to send ·{" "}
                      <span className="font-bold">Shift + Enter</span> for new
                      line
                    </p>
                  </>
                )}
              </div>
            </>
          ) : (
            <div
              className="flex-1 flex flex-col items-center justify-center px-6"
              style={{ background: "#fbf1df" }}
            >
              <Motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="text-center max-w-sm"
              >
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#dce8dc] to-[#c4d8c4] border-2 border-[#c4d8c4] flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <History className="w-9 h-9 text-[#3a4d39]" />
                </div>
                <h3 className="text-2xl font-black text-[#3a4d39] mb-3 tracking-tight">
                  No ticket selected
                </h3>
                <p className="text-sm text-[#8a6f4e] leading-relaxed mb-6">
                  Choose a ticket from the sidebar, or open a new one to get
                  help from our support team.
                </p>
                <div className="flex flex-col sm:flex-row items-center gap-3 justify-center">
                  <button
                    className="md:hidden w-full sm:w-auto flex items-center gap-2 justify-center px-5 py-3 rounded-xl border-2 border-[#3a4d39] text-[#3a4d39] text-sm font-bold hover:bg-[#dce8dc] transition-all duration-200 active:scale-95"
                    onClick={() => setSidebarOpen(true)}
                  >
                    <Menu className="w-4 h-4" />
                    View Tickets
                  </button>
                  <button
                    className="w-full sm:w-auto flex items-center gap-2 justify-center px-5 py-3 rounded-xl bg-[#3a4d39] text-white text-sm font-bold hover:bg-[#2a3a28] transition-all duration-200 shadow-lg shadow-[#3a4d39]/25 active:scale-95"
                    onClick={() => setShowCreateDialog(true)}
                  >
                    <Plus className="w-4 h-4" />
                    Create Ticket
                  </button>
                </div>
              </Motion.div>
            </div>
          )}
        </div>
      </div>

      {/* Create Ticket Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent
          className="w-[calc(100vw-32px)] sm:max-w-[500px] p-0 overflow-hidden border-2 border-[#e2d3b4] rounded-3xl shadow-2xl"
          style={{ background: "#fbf1df" }}
        >
          <div className="h-1 w-full bg-gradient-to-r from-[#b8a07a] via-[#3a4d39] to-[#b8a07a]" />
          <div className="p-6 sm:p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#dce8dc] to-[#c4d8c4] flex items-center justify-center flex-shrink-0 shadow-md">
                <MessageSquare className="w-6 h-6 text-[#3a4d39]" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-[#3a4d39] leading-tight">
                  New Support Ticket
                </DialogTitle>
                <DialogDescription className="text-xs text-[#8a6f4e] mt-0.5 font-medium">
                  We typically respond within 24 hours
                </DialogDescription>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="mono text-[10px] font-bold text-[#8a6f4e] uppercase tracking-widest">
                  Subject
                </label>
                <input
                  placeholder="Brief summary of your issue"
                  className="w-full rounded-xl border-2 border-[#e2d3b4] bg-white focus:border-[#3a4d39] focus:ring-2 focus:ring-[#3a4d39]/10 text-sm text-[#4a2e0e] placeholder:text-[#b8a07a] px-4 py-3 transition-all outline-none shadow-sm"
                  value={newTicket.subject}
                  onChange={(e) =>
                    setNewTicket({ ...newTicket, subject: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="mono text-[10px] font-bold text-[#8a6f4e] uppercase tracking-widest">
                  Description
                </label>
                <textarea
                  placeholder="Describe your issue in detail…"
                  rows={4}
                  className="w-full rounded-xl border-2 border-[#e2d3b4] bg-white focus:border-[#3a4d39] focus:ring-2 focus:ring-[#3a4d39]/10 text-sm text-[#4a2e0e] placeholder:text-[#b8a07a] px-4 py-3 transition-all outline-none resize-none shadow-sm"
                  value={newTicket.description}
                  onChange={(e) =>
                    setNewTicket({ ...newTicket, description: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="mono text-[10px] font-bold text-[#8a6f4e] uppercase tracking-widest">
                  Priority
                </label>
                <Select
                  value={newTicket.priority}
                  onValueChange={(v) =>
                    setNewTicket({ ...newTicket, priority: v })
                  }
                >
                  <SelectTrigger className="rounded-xl border-2 border-[#e2d3b4] bg-white text-sm text-[#4a2e0e] shadow-sm h-12">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent
                    className="rounded-xl border-2 border-[#e2d3b4] shadow-xl text-sm"
                    style={{ background: "#fbf1df" }}
                  >
                    {Object.entries(priorityConfig).map(([key, p]) => (
                      <SelectItem
                        key={key}
                        value={key}
                        className="focus:bg-[#eee5d0]"
                      >
                        <span className={`font-bold ${p.color}`}>
                          {p.label}
                        </span>
                        <span className="text-[#8a6f4e] ml-2">
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

            <div className="mt-6 flex gap-3">
              <button
                className="flex-1 py-3 rounded-xl border-2 border-[#e2d3b4] text-sm font-bold text-[#8a6f4e] hover:bg-[#eddfc8] transition-colors"
                onClick={() => setShowCreateDialog(false)}
              >
                Cancel
              </button>
              <button
                className="flex-1 py-3 rounded-xl bg-[#3a4d39] hover:bg-[#2a3a28] text-white text-sm font-bold tracking-wide transition-all shadow-lg shadow-[#3a4d39]/25 disabled:opacity-50 active:scale-95"
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
