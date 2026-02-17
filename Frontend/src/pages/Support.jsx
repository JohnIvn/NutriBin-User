import { useState, useEffect, useRef } from "react";
import {
  MessageSquare,
  Plus,
  Send,
  Shield,
  History,
  ChevronRight,
  Sparkles,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { Badge } from "@/components/ui/Badge";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
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

const statusConfig = {
  open: {
    label: "Open",
    icon: Clock,
    className: "bg-sky-50 text-sky-600 border border-sky-100",
    dot: "bg-sky-400",
  },
  "in-progress": {
    label: "In Review",
    icon: Sparkles,
    className: "bg-violet-50 text-violet-600 border border-violet-100",
    dot: "bg-violet-400",
  },
  resolved: {
    label: "Resolved",
    icon: CheckCircle,
    className: "bg-emerald-50 text-emerald-600 border border-emerald-100",
    dot: "bg-emerald-400",
  },
  closed: {
    label: "Closed",
    icon: XCircle,
    className: "bg-gray-100 text-gray-500 border border-gray-200",
    dot: "bg-gray-400",
  },
};

const priorityConfig = {
  low: { label: "Low", color: "text-slate-500", bar: "bg-slate-300" },
  medium: { label: "Medium", color: "text-amber-600", bar: "bg-amber-400" },
  high: { label: "High", color: "text-orange-600", bar: "bg-orange-400" },
  urgent: { label: "Urgent", color: "text-red-600", bar: "bg-red-500" },
};

function StatusBadge({ status }) {
  const cfg = statusConfig[status] || {
    label: status,
    className: "bg-gray-100 text-gray-500",
    dot: "bg-gray-400",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide ${cfg.className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} animate-pulse`} />
      {cfg.label}
    </span>
  );
}

function TicketCard({ ticket, isSelected, onClick }) {
  const pri = priorityConfig[ticket.priority] || priorityConfig.medium;
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3.5 border-b border-gray-50 transition-all duration-200 group relative ${
        isSelected ? "bg-white" : "hover:bg-white/60"
      }`}
    >
      {isSelected && (
        <span className="absolute left-0 top-0 h-full w-[3px] bg-gradient-to-b from-[#4F6F52] to-[#6fa372] rounded-r-full" />
      )}
      <div className="flex items-start justify-between gap-2 mb-2">
        <p
          className={`text-[13px] font-semibold leading-snug truncate pr-1 transition-colors ${isSelected ? "text-[#3A4D39]" : "text-gray-700 group-hover:text-gray-900"}`}
        >
          {ticket.subject}
        </p>
        <StatusBadge status={ticket.status} />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-gray-400 font-mono">
          #{ticket.ticket_id.slice(-6).toUpperCase()}
        </span>
        <div className="flex items-center gap-1.5">
          <span className={`text-[11px] font-medium ${pri.color}`}>
            {pri.label}
          </span>
          <span className="text-[11px] text-gray-300">·</span>
          <span className="text-[11px] text-gray-400">
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
        className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 shadow-sm ${
          isMe
            ? "bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600"
            : "bg-gradient-to-br from-[#4F6F52] to-[#3A5C3D] text-white"
        }`}
      >
        {isMe ? (
          (user?.first_name?.[0] ?? "U")
        ) : (
          <Shield className="w-3.5 h-3.5" />
        )}
      </div>
      <div
        className={`max-w-[78%] space-y-1 ${!isMe ? "items-end flex flex-col" : ""}`}
      >
        <div
          className={`px-4 py-3 text-[13px] leading-relaxed whitespace-pre-wrap ${
            isMe
              ? "bg-white border border-gray-100 text-gray-800 rounded-2xl rounded-bl-sm shadow-sm"
              : "bg-gradient-to-br from-[#4F6F52] to-[#3E5941] text-white rounded-2xl rounded-br-sm shadow-md shadow-[#4F6F52]/20"
          }`}
        >
          {isInitial ? msg.description : msg.message}
        </div>
        <span className="text-[10px] text-gray-400 px-1">
          {isMe ? (isInitial ? "Original inquiry" : "You") : "Support Team"}
          {!isInitial && msg.date_sent && (
            <>
              {" · "}
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

  useEffect(() => {
    if (user?.customer_id) fetchTickets();
  }, [user]);

  useEffect(() => {
    if (selectedTicket) fetchMessages(selectedTicket.ticket_id);
  }, [selectedTicket]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
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
    } catch (err) {
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
      console.error("Failed to load messages", err);
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
    } catch (err) {
      toast.error("Failed to create ticket");
    } finally {
      setCreateLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!replyText.trim() || !selectedTicket) return;
    const optimistic = {
      message_id: `temp-${Date.now()}`,
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
      if (res?.data) {
        setMessages((prev) =>
          prev.map((m) =>
            m.message_id === optimistic.message_id ? res.data : m,
          ),
        );
      }
    } catch (err) {
      toast.error("Failed to send message");
      setMessages((prev) =>
        prev.filter((m) => m.message_id !== optimistic.message_id),
      );
    }
  };

  const isClosed = selectedTicket?.status === "closed";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');
        .support-root { font-family: 'DM Sans', sans-serif; }
        .scrollbar-thin::-webkit-scrollbar { width: 4px; }
        .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 99px; }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
        .chat-input:focus { outline: none; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .msg-enter { animation: fadeUp 0.2s ease forwards; }
      `}</style>

      <div className="support-root flex w-full h-[calc(100vh-80px)] overflow-hidden bg-gray-50/50">
        {/* ── LEFT SIDEBAR ── */}
        <div className="w-[320px] flex-shrink-0 border-r border-gray-100 flex flex-col bg-white">
          {/* Header */}
          <div className="px-5 pt-5 pb-4 border-b border-gray-100">
            <div className="flex items-center justify-between mb-0.5">
              <div>
                <h1 className="support-serif text-[22px] text-gray-900 leading-tight">
                  Support
                </h1>
                <p className="text-[12px] text-gray-400 font-light mt-0.5">
                  {tickets.length} ticket{tickets.length !== 1 ? "s" : ""}
                </p>
              </div>

              <Dialog
                open={showCreateDialog}
                onOpenChange={setShowCreateDialog}
              >
                <DialogTrigger asChild>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#3A4D39] hover:bg-[#2f3e2e] text-white text-[12px] font-medium transition-all duration-150 shadow-sm shadow-[#3A4D39]/20 active:scale-95">
                    <Plus className="w-3.5 h-3.5" />
                    New
                  </button>
                </DialogTrigger>

                <DialogContent className="sm:max-w-[480px] bg-white border-0 shadow-2xl rounded-2xl p-0 overflow-hidden">
                  {/* Dialog gradient accent */}
                  <div className="h-1 w-full bg-gradient-to-r from-[#4F6F52] via-[#6fa372] to-[#4F6F52]" />
                  <div className="p-7">
                    <DialogHeader className="mb-5">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-[#4F6F52]/10 flex items-center justify-center">
                          <MessageSquare className="w-5 h-5 text-[#4F6F52]" />
                        </div>
                        <div>
                          <DialogTitle className="support-serif text-xl text-gray-900 leading-tight">
                            New support ticket
                          </DialogTitle>
                          <DialogDescription className="text-[12px] text-gray-400 font-light mt-0.5">
                            We typically respond within 24 hours
                          </DialogDescription>
                        </div>
                      </div>
                    </DialogHeader>

                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[12px] font-medium text-gray-600 uppercase tracking-wide">
                          Subject
                        </label>
                        <Input
                          placeholder="Brief summary of your issue"
                          className="rounded-xl border-gray-200 bg-gray-50 focus:bg-white text-[13px] transition-colors"
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
                        <label className="text-[12px] font-medium text-gray-600 uppercase tracking-wide">
                          Description
                        </label>
                        <Textarea
                          placeholder="Describe your issue in detail..."
                          rows={4}
                          className="rounded-xl border-gray-200 bg-gray-50 focus:bg-white text-[13px] resize-none transition-colors"
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
                        <label className="text-[12px] font-medium text-gray-600 uppercase tracking-wide">
                          Priority
                        </label>
                        <Select
                          value={newTicket.priority}
                          onValueChange={(v) =>
                            setNewTicket({ ...newTicket, priority: v })
                          }
                        >
                          <SelectTrigger className="rounded-xl border-gray-200 bg-gray-50 text-[13px]">
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-gray-100 shadow-xl text-[13px]">
                            {Object.entries(priorityConfig).map(([key, p]) => (
                              <SelectItem key={key} value={key}>
                                <span className={`font-medium ${p.color}`}>
                                  {p.label}
                                </span>
                                <span className="text-gray-400 ml-1">
                                  —{" "}
                                  {
                                    {
                                      low: "minor question or feedback",
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

                    <DialogFooter className="mt-6 flex gap-2">
                      <button
                        className="flex-1 py-2.5 rounded-xl border border-gray-200 text-[13px] font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                        onClick={() => setShowCreateDialog(false)}
                      >
                        Cancel
                      </button>
                      <button
                        className="flex-1 py-2.5 rounded-xl bg-[#3A4D39] hover:bg-[#2f3e2e] text-white text-[13px] font-medium transition-all shadow-sm shadow-[#3A4D39]/20 disabled:opacity-50 active:scale-[0.98]"
                        onClick={handleCreateTicket}
                        disabled={createLoading}
                      >
                        {createLoading ? "Submitting…" : "Submit Ticket"}
                      </button>
                    </DialogFooter>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Ticket list */}
          <div className="flex-1 overflow-y-auto scrollbar-thin">
            {loading ? (
              <div className="px-5 py-8 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse space-y-2">
                    <div className="h-3.5 bg-gray-100 rounded-full w-3/4" />
                    <div className="h-3 bg-gray-100 rounded-full w-1/2" />
                  </div>
                ))}
              </div>
            ) : tickets.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full pb-16 px-8 text-center">
                <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center mb-3">
                  <MessageSquare className="w-5 h-5 text-gray-300" />
                </div>
                <p className="text-[13px] font-medium text-gray-500">
                  No tickets yet
                </p>
                <p className="text-[12px] text-gray-400 mt-0.5">
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

        {/* ── RIGHT CHAT PANEL ── */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {selectedTicket ? (
            <>
              {/* Chat header */}
              <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-[#4F6F52]/10 flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-[#4F6F52]" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-[14px] font-semibold text-gray-900 truncate leading-tight">
                      {selectedTicket.subject}
                    </h2>
                    <div className="flex items-center gap-2 mt-0.5">
                      <StatusBadge status={selectedTicket.status} />
                      <span className="text-[11px] text-gray-300">·</span>
                      <span
                        className={`text-[11px] font-medium ${priorityConfig[selectedTicket.priority]?.color}`}
                      >
                        {priorityConfig[selectedTicket.priority]?.label}{" "}
                        priority
                      </span>
                      <span className="text-[11px] text-gray-300">·</span>
                      <span className="text-[11px] text-gray-400 font-mono">
                        #{selectedTicket.ticket_id.slice(-6).toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-[11px] text-gray-400 flex-shrink-0 ml-4">
                  Opened{" "}
                  {new Date(selectedTicket.date_created).toLocaleDateString(
                    "en-US",
                    { month: "short", day: "numeric", year: "numeric" },
                  )}
                </div>
              </div>

              {/* Messages */}
              <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto scrollbar-thin px-6 py-6 space-y-5 bg-gray-50/40"
              >
                {/* Original inquiry as first bubble */}
                <div className="msg-enter">
                  <MessageBubble
                    msg={selectedTicket}
                    user={user}
                    isInitial={true}
                  />
                </div>

                {messagesLoading ? (
                  <div className="flex justify-center py-4">
                    <div className="flex gap-1.5">
                      {[0, 0.15, 0.3].map((d, i) => (
                        <span
                          key={i}
                          className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"
                          style={{ animationDelay: `${d}s` }}
                        />
                      ))}
                    </div>
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
              <div className="flex-shrink-0 px-6 py-4 bg-white border-t border-gray-100">
                {isClosed ? (
                  <div className="flex items-center justify-center gap-2 py-3 rounded-xl bg-gray-50 border border-gray-100">
                    <XCircle className="w-4 h-4 text-gray-400" />
                    <span className="text-[13px] text-gray-400 font-medium">
                      This ticket has been closed
                    </span>
                  </div>
                ) : (
                  <div className="flex items-end gap-3 rounded-2xl border border-gray-200 bg-white px-4 pt-3 pb-3 shadow-sm focus-within:border-[#4F6F52]/40 focus-within:shadow-[0_0_0_3px_rgba(79,111,82,0.06)] transition-all duration-200">
                    <Textarea
                      placeholder="Write a message…"
                      className="chat-input flex-1 border-none bg-transparent p-0 min-h-[60px] max-h-[140px] resize-none text-[13px] text-gray-800 placeholder:text-gray-400 focus-visible:ring-0 shadow-none"
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
                      className="flex-shrink-0 mb-0.5 w-9 h-9 rounded-xl bg-[#3A4D39] hover:bg-[#2f3e2e] disabled:bg-gray-200 disabled:cursor-not-allowed text-white flex items-center justify-center transition-all duration-150 active:scale-90 shadow-sm shadow-[#3A4D39]/20"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                )}
                {!isClosed && (
                  <p className="text-center text-[11px] text-gray-400 mt-2">
                    Press{" "}
                    <kbd className="px-1 py-0.5 rounded border border-gray-200 bg-gray-50 font-mono text-[10px] text-gray-500">
                      ↵ Enter
                    </kbd>{" "}
                    to send ·{" "}
                    <kbd className="px-1 py-0.5 rounded border border-gray-200 bg-gray-50 font-mono text-[10px] text-gray-500">
                      ⇧ Shift+Enter
                    </kbd>{" "}
                    for new line
                  </p>
                )}
              </div>
            </>
          ) : (
            /* Empty state */
            <div className="flex-1 flex flex-col items-center justify-center bg-gray-50/40">
              <div className="text-center max-w-[280px]">
                <div className="w-16 h-16 rounded-3xl bg-white border border-gray-100 shadow-sm flex items-center justify-center mx-auto mb-5">
                  <History className="w-7 h-7 text-gray-300" />
                </div>
                <h3 className="support-serif text-xl text-gray-800 mb-1.5">
                  Select a ticket
                </h3>
                <p className="text-[13px] text-gray-400 leading-relaxed">
                  Choose a ticket from the sidebar to view your conversation
                  with our support team.
                </p>
                <button
                  className="mt-5 flex items-center gap-2 mx-auto px-4 py-2 rounded-xl bg-[#3A4D39] text-white text-[13px] font-medium shadow-sm hover:bg-[#2f3e2e] transition-colors"
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
