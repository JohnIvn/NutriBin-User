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
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
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

// ── Palette (all derived from #fbf1df) ──────────────────────────────
// bg:        #fbf1df  (main warm cream)
// surface:   #f5e8cc  (slightly deeper parchment — sidebar)
// border:    #e8d9be  (warm tan divider)
// muted:     #c4aa82  (mid-tone warm brown)
// subtle:    #a8906a  (deeper warm text)
// strong:    #5c3d1e  (dark walnut — headings, selected)
// accent:    #7c5c38  (warm brown — buttons, active)
// accent-lt: #e8d4b0  (light accent fill)

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
      className={`inline-flex items-center gap-1.5 px-2.5 py-[3px] rounded-full text-[10px] font-semibold tracking-wider uppercase ${cfg.className}`}
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
      className={`w-full text-left px-5 py-4 border-b border-[#e8d9be] transition-all duration-150 group relative ${
        isSelected ? "bg-[#fbf1df]" : "hover:bg-[#f8edd4]"
      }`}
    >
      {isSelected && (
        <span className="absolute left-0 top-0 h-full w-[3px] bg-[#7c5c38] rounded-r-sm" />
      )}
      <div className="flex items-start justify-between gap-2 mb-2">
        <p
          className={`text-[13px] font-semibold leading-snug truncate pr-1 transition-colors ${
            isSelected
              ? "text-[#5c3d1e]"
              : "text-[#7c6248] group-hover:text-[#5c3d1e]"
          }`}
        >
          {ticket.subject}
        </p>
        <StatusBadge status={ticket.status} />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-[#c4aa82] font-mono tracking-wider">
          #{ticket.ticket_id.slice(-6).toUpperCase()}
        </span>
        <div className="flex items-center gap-1.5">
          <span className={`text-[10px] font-semibold ${pri.color}`}>
            {pri.label}
          </span>
          <span className="text-[#dbc9a8]">·</span>
          <span className="text-[10px] text-[#c4aa82]">
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
          isMe ? "bg-[#e8d9be] text-[#7c5c38]" : "bg-[#7c5c38] text-[#fbf1df]"
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
              ? "bg-white border border-[#e8d9be] text-[#5c3d1e] rounded-2xl rounded-bl-sm shadow-sm"
              : "bg-[#7c5c38] text-[#fbf1df] rounded-2xl rounded-br-sm shadow-md shadow-[#7c5c38]/15"
          }`}
        >
          {isInitial ? msg.description : msg.message}
        </div>
        <span className="text-[10px] text-[#c4aa82] px-1">
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
  const scrollRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    if (user?.customer_id) fetchTickets();
  }, [user]);
  useEffect(() => {
    if (selectedTicket) fetchMessages(selectedTicket.ticket_id);
  }, [selectedTicket]);
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

  // 3. Initialize Socket Connection
  useEffect(() => {
    // Replace with your NestJS server URL
    const baseUrl = getBaseUrl();

    socketRef.current = io(baseUrl, {
      transports: ["websocket"],
    });

    socketRef.current.on("connect", () =>
      console.log("Connected to Support WS"),
    );

    // 4. Listen for Real-time Messages
    socketRef.current.on("new_message_received", (newMessage) => {
      // Only append if it's not from the current user (to avoid duplicates with optimistic UI)
      // or if it's a message from the Support Team
      setMessages((prev) => {
        const exists = prev.find((m) => m.message_id === newMessage.message_id);
        if (exists) return prev;
        return [...prev, newMessage];
      });
    });

    // 5. Listen for Ticket Status Updates (e.g., agent closes the ticket)
    socketRef.current.on("ticket_status_updated", (updatedTicket) => {
      // Update the ticket in the sidebar list
      setTickets((prev) =>
        prev.map((t) =>
          t.ticket_id === updatedTicket.ticket_id ? updatedTicket : t,
        ),
      );
      // Update the selected ticket header if it's the one we are looking at
      setSelectedTicket((current) =>
        current?.ticket_id === updatedTicket.ticket_id
          ? updatedTicket
          : current,
      );

      if (updatedTicket.status === "closed") {
        toast.info("This ticket has been marked as closed.");
      }
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  // 6. Join the specific Ticket Room whenever the selection changes
  useEffect(() => {
    if (selectedTicket && socketRef.current) {
      socketRef.current.emit("joinTicket", {
        ticketId: selectedTicket.ticket_id,
      });
      fetchMessages(selectedTicket.ticket_id);
    }
  }, [selectedTicket]);

  // ... (Keep your fetchTickets, fetchMessages, handleCreateTicket)

  const handleSendMessage = async () => {
    if (!replyText.trim() || !selectedTicket) return;

    // Optimistic UI update
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

      // Replace optimistic message with real DB message
      if (res?.data) {
        setMessages((prev) =>
          prev.map((m) => (m.message_id === optimisticId ? res.data : m)),
        );
      }
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
        .mono         { font-family: 'Geist Mono', ui-monospace, monospace !important; }

        .scrollbar-warm::-webkit-scrollbar       { width: 4px; }
        .scrollbar-warm::-webkit-scrollbar-track  { background: transparent; }
        .scrollbar-warm::-webkit-scrollbar-thumb  { background: #dbc9a8; border-radius: 99px; }
        .scrollbar-warm::-webkit-scrollbar-thumb:hover { background: #c4aa82; }

        .chat-input { caret-color: #7c5c38; }
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

        .skel { background: linear-gradient(90deg, #e8d9be 0%, #f0e4cc 50%, #e8d9be 100%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 4px; }
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

        /* Dialog overlay */
        [data-radix-dialog-overlay] { background: rgba(92,61,30,0.25) !important; backdrop-filter: blur(3px); }
      `}</style>

      <div
        className="support-root flex w-full h-[calc(100vh-80px)] overflow-hidden"
        style={{ background: "#fbf1df" }}
      >
        {/* ── SIDEBAR ─────────────────────────────────────────── */}
        <div
          className="w-[300px] flex-shrink-0 border-r border-[#e8d9be] flex flex-col"
          style={{ background: "#f5e8cc" }}
        >
          {/* Header */}
          <div className="px-5 pt-6 pb-5 border-b border-[#e8d9be]">
            <div className="flex items-start justify-between">
              <div>
                <p className="mono text-[10px] font-medium tracking-[0.18em] text-[#c4aa82] uppercase mb-1.5">
                  Support Center
                </p>
                <h1 className="text-[22px] font-semibold text-[#5c3d1e] leading-tight tracking-tight">
                  Your Tickets
                </h1>
                <p className="text-[11px] text-[#a8906a] mt-1">
                  {tickets.length} {tickets.length === 1 ? "thread" : "threads"}
                </p>
              </div>

              <Dialog
                open={showCreateDialog}
                onOpenChange={setShowCreateDialog}
              >
                <DialogTrigger asChild>
                  <button className="mt-1 flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#7c5c38] hover:bg-[#5c3d1e] text-[#fbf1df] text-[11px] font-semibold tracking-wide transition-all duration-150 active:scale-95 shadow-md shadow-[#7c5c38]/20">
                    <Plus className="w-3.5 h-3.5" />
                    New
                  </button>
                </DialogTrigger>

                {/* ── Create Dialog ── */}
                <DialogContent
                  className="sm:max-w-[460px] p-0 overflow-hidden border border-[#e8d9be] rounded-2xl shadow-2xl shadow-[#5c3d1e]/10"
                  style={{ background: "#fbf1df" }}
                >
                  <div className="h-[3px] w-full bg-gradient-to-r from-[#a8906a] via-[#7c5c38] to-[#a8906a]" />
                  <div className="p-7">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-[#e8d9be] flex items-center justify-center">
                        <MessageSquare className="w-5 h-5 text-[#7c5c38]" />
                      </div>
                      <div>
                        <DialogTitle className="text-[17px] font-semibold text-[#5c3d1e] leading-tight">
                          New support ticket
                        </DialogTitle>
                        <DialogDescription className="text-[12px] text-[#a8906a] mt-0.5">
                          We typically respond within 24 hours
                        </DialogDescription>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="mono text-[10px] font-medium text-[#a8906a] uppercase tracking-[0.12em]">
                          Subject
                        </label>
                        <input
                          placeholder="Brief summary of your issue"
                          className="w-full rounded-xl border border-[#e8d9be] bg-white focus:border-[#7c5c38] text-[13px] text-[#5c3d1e] placeholder:text-[#c4aa82] px-3.5 py-2.5 transition-all outline-none shadow-sm"
                          value={newTicket.subject}
                          onChange={(e) =>
                            setNewTicket({
                              ...newTicket,
                              subject: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="mono text-[10px] font-medium text-[#a8906a] uppercase tracking-[0.12em]">
                          Description
                        </label>
                        <textarea
                          placeholder="Describe your issue in detail…"
                          rows={4}
                          className="w-full rounded-xl border border-[#e8d9be] bg-white focus:border-[#7c5c38] text-[13px] text-[#5c3d1e] placeholder:text-[#c4aa82] px-3.5 py-2.5 transition-all outline-none resize-none shadow-sm"
                          value={newTicket.description}
                          onChange={(e) =>
                            setNewTicket({
                              ...newTicket,
                              description: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="mono text-[10px] font-medium text-[#a8906a] uppercase tracking-[0.12em]">
                          Priority
                        </label>
                        <Select
                          value={newTicket.priority}
                          onValueChange={(v) =>
                            setNewTicket({ ...newTicket, priority: v })
                          }
                        >
                          <SelectTrigger className="rounded-xl border-[#e8d9be] bg-white text-[13px] text-[#5c3d1e] shadow-sm">
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                          <SelectContent
                            className="rounded-xl border-[#e8d9be] shadow-xl text-[13px]"
                            style={{ background: "#fbf1df" }}
                          >
                            {Object.entries(priorityConfig).map(([key, p]) => (
                              <SelectItem
                                key={key}
                                value={key}
                                className="focus:bg-[#f0e4cc]"
                              >
                                <span className={`font-semibold ${p.color}`}>
                                  {p.label}
                                </span>
                                <span className="text-[#a8906a] ml-1.5">
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

                    <div className="mt-6 flex gap-2.5">
                      <button
                        className="flex-1 py-2.5 rounded-xl border border-[#e8d9be] text-[12px] font-semibold text-[#a8906a] hover:bg-[#f0e4cc] transition-colors"
                        onClick={() => setShowCreateDialog(false)}
                      >
                        Cancel
                      </button>
                      <button
                        className="flex-1 py-2.5 rounded-xl bg-[#7c5c38] hover:bg-[#5c3d1e] text-[#fbf1df] text-[12px] font-semibold tracking-wide transition-all shadow-md shadow-[#7c5c38]/20 disabled:opacity-50 active:scale-[0.98]"
                        onClick={handleCreateTicket}
                        disabled={createLoading}
                      >
                        {createLoading ? "Submitting…" : "Submit Ticket"}
                      </button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Ticket list */}
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
                <div className="w-12 h-12 rounded-2xl bg-[#e8d9be] flex items-center justify-center mb-3">
                  <MessageSquare className="w-5 h-5 text-[#c4aa82]" />
                </div>
                <p className="text-[14px] font-semibold text-[#7c6248]">
                  No tickets yet
                </p>
                <p className="text-[12px] text-[#c4aa82] mt-0.5">
                  Create one to get started
                </p>
              </div>
            ) : (
              tickets.map((ticket) => (
                <TicketCard
                  key={ticket.ticket_id}
                  ticket={ticket}
                  isSelected={selectedTicket?.ticket_id === ticket.ticket_id}
                  onClick={() => setSelectedTicket(ticket)}
                />
              ))
            )}
          </div>
        </div>

        {/* ── CHAT PANEL ──────────────────────────────────────── */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {selectedTicket ? (
            <>
              {/* Chat header */}
              <div
                className="flex-shrink-0 flex items-center justify-between px-7 py-4 border-b border-[#e8d9be]"
                style={{ background: "#f5e8cc" }}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-[#e8d9be] flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-[#7c5c38]" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-[15px] font-semibold text-[#5c3d1e] truncate leading-tight">
                      {selectedTicket.subject}
                    </h2>
                    <div className="flex items-center gap-2 mt-0.5">
                      <StatusBadge status={selectedTicket.status} />
                      <span className="text-[#dbc9a8]">·</span>
                      <span
                        className={`mono text-[10px] font-medium tracking-wider uppercase ${priorityConfig[selectedTicket.priority]?.color}`}
                      >
                        {priorityConfig[selectedTicket.priority]?.label}
                      </span>
                      <span className="text-[#dbc9a8]">·</span>
                      <span className="mono text-[10px] text-[#c4aa82] tracking-wider">
                        #{selectedTicket.ticket_id.slice(-6).toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mono text-[11px] text-[#c4aa82] flex-shrink-0 ml-4">
                  {new Date(selectedTicket.date_created).toLocaleDateString(
                    "en-US",
                    { month: "long", day: "numeric", year: "numeric" },
                  )}
                </div>
              </div>

              {/* Messages */}
              <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto scrollbar-warm px-7 py-7 space-y-5"
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
                        className="w-2 h-2 bg-[#c4aa82] rounded-full dot-bounce"
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
                className="flex-shrink-0 px-7 py-5 border-t border-[#e8d9be]"
                style={{ background: "#f5e8cc" }}
              >
                {isClosed ? (
                  <div className="flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#e8d9be] border border-[#dbc9a8]">
                    <XCircle className="w-4 h-4 text-[#c4aa82]" />
                    <span className="text-[12px] text-[#a8906a] font-medium">
                      This ticket has been closed
                    </span>
                  </div>
                ) : (
                  <>
                    <div className="flex items-end gap-3 rounded-xl border border-[#e8d9be] bg-white px-4 pt-3 pb-3 shadow-sm transition-all duration-200 focus-within:border-[#7c5c38] focus-within:shadow-[0_0_0_3px_rgba(124,92,56,0.08)]">
                      <textarea
                        placeholder="Write a message…"
                        className="chat-input flex-1 border-none bg-transparent p-0 min-h-[56px] max-h-[130px] resize-none text-[13px] text-[#5c3d1e] placeholder:text-[#c4aa82] focus-visible:ring-0 shadow-none outline-none leading-relaxed"
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
                        className="flex-shrink-0 mb-0.5 w-9 h-9 rounded-xl bg-[#7c5c38] hover:bg-[#5c3d1e] disabled:bg-[#e8d9be] disabled:cursor-not-allowed text-[#fbf1df] disabled:text-[#c4aa82] flex items-center justify-center transition-all duration-150 active:scale-90 shadow-sm"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="mono text-center text-[10px] text-[#c4aa82] mt-2.5 tracking-wide">
                      ↵ Enter to send · ⇧ Shift+Enter for new line
                    </p>
                  </>
                )}
              </div>
            </>
          ) : (
            /* Empty state */
            <div
              className="flex-1 flex flex-col items-center justify-center"
              style={{ background: "#fbf1df" }}
            >
              <div className="text-center max-w-[260px]">
                <div className="w-16 h-16 rounded-3xl bg-[#f0e4cc] border border-[#e8d9be] flex items-center justify-center mx-auto mb-5 shadow-inner">
                  <History className="w-6 h-6 text-[#c4aa82]" />
                </div>
                <h3 className="text-[20px] font-semibold text-[#7c6248] mb-2 tracking-tight">
                  No ticket selected
                </h3>
                <p className="text-[13px] text-[#a8906a] leading-relaxed">
                  Choose a ticket from the sidebar, or open a new one to get
                  help from our team.
                </p>
                <button
                  className="mt-5 flex items-center gap-2 mx-auto px-4 py-2.5 rounded-xl bg-[#7c5c38] text-[#fbf1df] text-[12px] font-semibold hover:bg-[#5c3d1e] transition-colors shadow-md shadow-[#7c5c38]/20 active:scale-95"
                  onClick={() => setShowCreateDialog(true)}
                >
                  <Plus className="w-4 h-4" />
                  Open a ticket
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
