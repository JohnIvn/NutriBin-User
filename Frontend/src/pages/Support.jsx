import { useState, useEffect, useRef } from "react";
import {
  MessageSquare,
  Plus,
  Search,
  Send,
  Clock,
  User,
  AlertCircle,
  CheckCircle2,
  Shield,
  History,
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
import { Avatar, AvatarFallback } from "@/components/ui/Avatar";
import { useUser } from "@/contexts/UserContextHook";
import Requests from "@/utils/Requests";

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
    if (user?.customer_id) {
      fetchTickets();
    }
  }, [user]);

  useEffect(() => {
    if (selectedTicket) {
      fetchMessages(selectedTicket.ticket_id);
    }
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
        if (res.data.length > 0 && !selectedTicket) {
          setSelectedTicket(res.data[0]);
        }
      }
    } catch (err) {
      console.error("Failed to load tickets", err);
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
      if (res?.data) {
        setMessages(res.data);
      }
    } catch (err) {
      console.error("Failed to load messages", err);
    } finally {
      setMessagesLoading(false);
    }
  }

  const handleCreateTicket = async () => {
    if (!newTicket.subject || !newTicket.description) {
      return toast.error("Please fill in all required fields");
    }

    setCreateLoading(true);
    try {
      const res = await Requests({
        url: "/support/tickets",
        method: "POST",
        data: {
          ...newTicket,
          customerId: user.customer_id,
        },
      });

      if (res?.data) {
        toast.success("Ticket created successfully");
        setShowCreateDialog(false);
        setNewTicket({ subject: "", description: "", priority: "medium" });
        fetchTickets();
      }
    } catch (err) {
      console.error("Failed to create ticket", err);
      toast.error("Failed to create ticket");
    } finally {
      setCreateLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!replyText.trim() || !selectedTicket) return;

    try {
      const res = await Requests({
        url: `/support/tickets/${selectedTicket.ticket_id}/messages`,
        method: "POST",
        data: {
          senderId: user.customer_id,
          message: replyText,
        },
      });

      if (res?.data) {
        setMessages([...messages, res.data]);
        setReplyText("");
      }
    } catch (err) {
      console.error("Failed to send message", err);
      toast.error("Failed to send message");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "open":
        return (
          <Badge className="bg-blue-100 text-blue-700 border-blue-200">
            Open
          </Badge>
        );
      case "in-progress":
        return (
          <Badge className="bg-amber-100 text-amber-700 border-amber-200">
            Under Review
          </Badge>
        );
      case "resolved":
        return (
          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
            Resolved
          </Badge>
        );
      case "closed":
        return <Badge variant="secondary">Closed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      {/* LEFT SIDEBAR - MY TICKETS */}
      <div className="w-[350px] border-r border-gray-100 flex flex-col bg-slate-50/30">
        <div className="p-4 border-b border-gray-100 space-y-4 bg-white">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold text-gray-800">Support Center</h1>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  className="bg-[#4F6F52] hover:bg-[#3E5941] text-white"
                >
                  <Plus className="w-4 h-4 mr-1" /> New Ticket
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Need help?</DialogTitle>
                  <DialogDescription>
                    Submit a ticket and our team will get back to you.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Subject</label>
                    <Input
                      placeholder="What can we help you with?"
                      value={newTicket.subject}
                      onChange={(e) =>
                        setNewTicket({ ...newTicket, subject: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                      placeholder="Provide details about your issue..."
                      rows={4}
                      value={newTicket.description}
                      onChange={(e) =>
                        setNewTicket({
                          ...newTicket,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Priority</label>
                    <Select
                      value={newTicket.priority}
                      onValueChange={(value) =>
                        setNewTicket({ ...newTicket, priority: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">
                          Low - Minor question or feedback
                        </SelectItem>
                        <SelectItem value="medium">
                          Medium - General inquiry or issue
                        </SelectItem>
                        <SelectItem value="high">
                          High - Critical problem or malfunction
                        </SelectItem>
                        <SelectItem value="urgent">
                          Urgent - Emergency support needed
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="ghost"
                    onClick={() => setShowCreateDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="bg-[#4F6F52] hover:bg-[#3E5941]"
                    onClick={handleCreateTicket}
                    disabled={createLoading}
                  >
                    {createLoading ? "Submitting..." : "Submit Ticket"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="p-8 text-center text-sm text-gray-500">
              Loading your tickets...
            </div>
          ) : tickets.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <MessageSquare className="w-8 h-8 mx-auto text-gray-300" />
              <p className="text-sm text-gray-500 font-medium">
                No active tickets
              </p>
            </div>
          ) : (
            tickets.map((ticket) => (
              <div
                key={ticket.ticket_id}
                onClick={() => setSelectedTicket(ticket)}
                className={`p-4 border-b border-gray-50 cursor-pointer transition-all hover:bg-white relative ${
                  selectedTicket?.ticket_id === ticket.ticket_id
                    ? "bg-white border-l-4 border-l-[#4F6F52] shadow-sm"
                    : ""
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <h3
                    className={`text-sm font-semibold truncate pr-2 ${
                      selectedTicket?.ticket_id === ticket.ticket_id
                        ? "text-[#4F6F52]"
                        : "text-gray-800"
                    }`}
                  >
                    {ticket.subject}
                  </h3>
                  <span className="text-[10px] text-gray-400 whitespace-nowrap">
                    {new Date(ticket.date_created).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-gray-500">
                    Ticket ID: ...{ticket.ticket_id.slice(-6)}
                  </span>
                  {getStatusBadge(ticket.status)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* RIGHT CONTENT - CHAT */}
      <div className="flex-1 flex flex-col bg-white">
        {selectedTicket ? (
          <>
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white shadow-sm z-10">
              <div className="flex items-center gap-4">
                <div className="p-2.5 rounded-xl bg-[#4F6F52]/10 text-[#4F6F52]">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 leading-tight">
                    {selectedTicket.subject}
                  </h2>
                  <div className="flex items-center gap-2 text-[10px] text-gray-500 mt-0.5">
                    <span>
                      Opened on{" "}
                      {new Date(selectedTicket.date_created).toLocaleString()}
                    </span>
                    <span>•</span>
                    <span className="capitalize">
                      {selectedTicket.priority} Priority
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div
              className="flex-1 bg-[#FDFCF9] overflow-y-auto p-6 flex flex-col gap-6 custom-scrollbar"
              ref={scrollRef}
            >
              {/* ORIGINAL DESCRIPTION */}
              <div className="flex gap-3 justify-start max-w-[85%]">
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {user.first_name[0]}
                </div>
                <div className="space-y-1">
                  <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                    <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                      {selectedTicket.description}
                    </p>
                  </div>
                  <span className="text-[10px] text-gray-400 ml-1">
                    Your detailed inquiry
                  </span>
                </div>
              </div>

              {messages.map((msg, idx) => {
                const isMe = msg.sender_type === "customer";
                return (
                  <div
                    key={msg.message_id || idx}
                    className={`flex gap-3 ${isMe ? "justify-start" : "justify-end"} max-w-[85%] ${isMe ? "" : "ml-auto flex-row-reverse"}`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                        isMe
                          ? "bg-slate-200 text-gray-600"
                          : "bg-[#4F6F52] text-white"
                      }`}
                    >
                      {isMe ? (
                        user.first_name[0]
                      ) : (
                        <Shield className="w-4 h-4" />
                      )}
                    </div>
                    <div
                      className={`space-y-1 ${!isMe ? "items-end flex flex-col" : ""}`}
                    >
                      <div
                        className={`p-4 rounded-2xl border shadow-[0_2px_10px_rgba(0,0,0,0.02)] ${
                          isMe
                            ? "bg-white text-gray-800 border-slate-100 rounded-tl-none"
                            : "bg-[#4F6F52] text-white border-[#4F6F52] rounded-tr-none"
                        }`}
                      >
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                          {msg.message}
                        </p>
                      </div>
                      <span className="text-[10px] text-gray-400 px-1">
                        {isMe ? "Sent" : "Support Team"} •{" "}
                        {new Date(msg.date_sent).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* REPLY AREA */}
            <div className="p-4 border-t border-gray-100 bg-white">
              <div
                className={`relative bg-slate-50 rounded-2xl border border-slate-100 p-2 transition-all focus-within:border-[#4F6F52]/50 ${selectedTicket.status === "closed" ? "opacity-50 pointer-events-none" : ""}`}
              >
                <Textarea
                  placeholder={
                    selectedTicket.status === "closed"
                      ? "This ticket is closed."
                      : "Type your message here..."
                  }
                  className="bg-transparent border-none focus-visible:ring-0 min-h-[80px] resize-none pr-12"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                />
                <div className="flex justify-end p-2 pt-0">
                  <Button
                    size="sm"
                    className="bg-[#4F6F52] hover:bg-[#3E5941] text-white rounded-xl shadow-lg shadow-[#4F6F52]/10"
                    onClick={handleSendMessage}
                    disabled={
                      !replyText.trim() || selectedTicket.status === "closed"
                    }
                  >
                    <Send className="w-4 h-4 mr-2" /> Send
                  </Button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-12">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
              <History className="w-8 h-8 text-slate-200" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-1">
              Select a Ticket
            </h3>
            <p className="text-center max-w-xs text-sm">
              View your ongoing conversations with our support team by selecting
              a ticket from the list.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
