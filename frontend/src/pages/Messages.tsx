import { useEffect, useState, type FormEvent } from "react";
import { NavLink, Outlet } from "react-router-dom";
import type { MessageDto } from "@mafioo/shared";
import { api, ApiError } from "../api/client";
import { DataTable } from "../design-system/DataTable";

export function MessagesLayout() {
  return (
    <div>
      <h2>Mailbox</h2>
      <div className="tabs">
        {[
          { to: "/msg/inbox", label: "Inbox" },
          { to: "/msg/sent", label: "Sent" },
          { to: "/msg/write", label: "Write" },
        ].map((t) => (
          <NavLink key={t.to} to={t.to} className={({ isActive }) => `tabs__tab ${isActive ? "tabs__tab--active" : ""}`}>
            {t.label}
          </NavLink>
        ))}
      </div>
      <Outlet />
    </div>
  );
}

function MessageList({ folder }: { folder: "inbox" | "sent" }) {
  const [messages, setMessages] = useState<MessageDto[] | null>(null);

  useEffect(() => {
    api.get<{ messages: MessageDto[] }>(`/msg/${folder}`).then((d) => setMessages(d.messages));
  }, [folder]);

  if (!messages) return <p>Loading...</p>;

  return (
    <DataTable
      rows={messages}
      rowKey={(m) => m.id}
      emptyMessage="No messages."
      columns={[
        { key: "who", header: folder === "inbox" ? "From" : "To", render: (m) => (folder === "inbox" ? m.senderUsername : m.recipientUsername) },
        { key: "subject", header: "Subject", render: (m) => m.subject },
        { key: "date", header: "Date", render: (m) => new Date(m.createdAt).toLocaleString() },
        { key: "read", header: "Status", render: (m) => (m.readAt ? "Read" : "Unread") },
      ]}
    />
  );
}

export function InboxPage() {
  return <MessageList folder="inbox" />;
}

export function SentPage() {
  return <MessageList folder="sent" />;
}

export function WritePage() {
  const [recipientUsername, setRecipient] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSent(false);
    setBusy(true);
    try {
      await api.post("/msg/send", { recipientUsername, subject, body });
      setSent(true);
      setSubject("");
      setBody("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to send");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} style={{ maxWidth: 480 }}>
      <div className="form-row">
        <label>To (username)</label>
        <input className="input" value={recipientUsername} onChange={(e) => setRecipient(e.target.value)} required />
      </div>
      <div className="form-row">
        <label>Subject</label>
        <input className="input" value={subject} onChange={(e) => setSubject(e.target.value)} required />
      </div>
      <div className="form-row">
        <label>Message</label>
        <textarea className="input" rows={6} value={body} onChange={(e) => setBody(e.target.value)} required />
      </div>
      {error && <p className="error-text">{error}</p>}
      {sent && <p className="success-text">Message sent.</p>}
      <button className="button" type="submit" disabled={busy}>
        {busy ? "Sending..." : "Send"}
      </button>
    </form>
  );
}
