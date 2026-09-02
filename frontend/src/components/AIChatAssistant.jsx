import React, { useState } from "react";
import API from "../services/api";
import { Cpu, MessageSquare, Send, Bot, User, RefreshCw, Zap } from "lucide-react";

const QUICK_PROMPTS = [
  "What is AES-256 encryption?",
  "How does IPFS store my files?",
  "Explain how SHA-256 hashing works",
  "What is a blockchain smart contract?",
  "How do I improve my security score?",
  "Why is my file risk rating HIGH?",
];

const KNOWLEDGE_BASE = {
  "aes-256": "AES-256 (Advanced Encryption Standard with 256-bit key) is the gold standard in symmetric encryption. Your files are encrypted using AES-256-CBC mode with a unique random IV (Initialization Vector) per file, making each encrypted file cryptographically unique even if contents are identical. It would take longer than the age of the universe to brute-force with current technology.",
  "ipfs": "IPFS (InterPlanetary File System) is a peer-to-peer decentralized storage network. Instead of storing your file on a single server (which is a single point of failure), IPFS distributes content across thousands of nodes. Each file receives a unique CID (Content Identifier) — a cryptographic hash of the file's content. This means the file is always retrievable as long as any node has it.",
  "sha-256": "SHA-256 (Secure Hash Algorithm 256-bit) generates a unique 64-character fingerprint of any file. If even a single byte of the file changes, the hash completely changes. This is how your file integrity verification works — we compare the hash of your uploaded file with the originally stored hash. If they match, the file is authentic. If not, tampering is detected.",
  "smart contract": "A smart contract is self-executing code deployed on the Ethereum blockchain. Your FileRegistry.sol contract stores your file's SHA-256 hash, IPFS CID, wallet address, and timestamp on an immutable, public ledger. Once written, nobody — not even an administrator — can alter or delete this record. This creates a permanent, legally verifiable proof of file ownership.",
  "security score": "Your security score is calculated based on: (1) Password strength entropy, (2) Whether files are AES-256 encrypted, (3) IPFS pinning status, (4) Blockchain registration, (5) Number of active IDS threats. To improve it: use the AI password generator, always upload with IPFS pinning enabled, and register important files on the blockchain.",
  "risk": "File risk rating is determined by: (1) File extension safety check, (2) MIME-type consistency verification, (3) Magic bytes header inspection (checking if a .pdf actually has PDF magic bytes or is masquerading as something else), (4) Binary entropy analysis. CRITICAL/HIGH risk files should be quarantined before opening.",
};

function match(input) {
  const lower = input.toLowerCase();
  for (const [key, val] of Object.entries(KNOWLEDGE_BASE)) {
    if (lower.includes(key)) return val;
  }
  return null;
}

export default function AIChatAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: "Hello! I'm your AI Security Assistant. I can explain encryption, blockchain transactions, IPFS storage, and security threats in simple language. Ask me anything!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async (text) => {
    const userMsg = text || input.trim();
    if (!userMsg) return;

    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setInput("");
    setLoading(true);

    // First check local knowledge base for instant response
    const localAnswer = match(userMsg);

    await new Promise((r) => setTimeout(r, 600 + Math.random() * 400));

    if (localAnswer) {
      setMessages((prev) => [...prev, { role: "ai", text: localAnswer }]);
    } else {
      // Try AI endpoint
      try {
        const res = await API.get(`/ai/recommendations`);
        const recs = res.data.recommendations;
        const aiText = recs?.length
          ? `Based on your system telemetry: ${recs.map((r) => r.recommendation).join(" | ")}`
          : "I can help with questions about AES-256 encryption, IPFS storage, blockchain smart contracts, SHA-256 hashing, and your security score. Try one of the quick prompts below!";
        setMessages((prev) => [...prev, { role: "ai", text: aiText }]);
      } catch (_) {
        setMessages((prev) => [...prev, {
          role: "ai",
          text: "I can help explain: AES-256 encryption, IPFS storage, SHA-256 hashing, blockchain smart contracts, security scores, and file risk ratings. Try asking about any of these topics!",
        }]);
      }
    }
    setLoading(false);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl gradient-brand flex items-center justify-center shadow-2xl shadow-cyan-500/30 hover:scale-110 transition-transform"
        title="AI Security Assistant"
      >
        <Bot className="w-7 h-7 text-slate-950" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-slate-950 animate-pulse" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 sm:w-96 flex flex-col glass border border-slate-700 rounded-2xl shadow-2xl shadow-slate-950/50 overflow-hidden animate-fade-in" style={{ height: "520px" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-gradient-to-r from-cyan-500/10 to-emerald-500/5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl gradient-brand flex items-center justify-center">
            <Bot className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-100">AI Security Assistant</p>
            <p className="text-[10px] text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
              Online · Powered by SecureVault AI
            </p>
          </div>
        </div>
        <button onClick={() => setOpen(false)} className="text-slate-500 hover:text-slate-300 p-1">✕</button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto custom-scroll p-4 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs ${msg.role === "ai" ? "gradient-brand text-slate-950" : "bg-slate-700 text-slate-300"}`}>
              {msg.role === "ai" ? <Bot className="w-4 h-4" /> : <User className="w-3.5 h-3.5" />}
            </div>
            <div className={`max-w-[75%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed ${
              msg.role === "ai"
                ? "bg-slate-800/80 text-slate-200 rounded-tl-sm"
                : "bg-cyan-500/20 text-cyan-100 rounded-tr-sm border border-cyan-500/20"
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-2.5">
            <div className="w-7 h-7 rounded-full gradient-brand flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-slate-950" />
            </div>
            <div className="bg-slate-800/80 px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1.5">
              {[0,1,2].map((i) => (
                <span key={i} className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Quick Prompts */}
      <div className="px-3 py-2 border-t border-slate-800/50 flex gap-1.5 overflow-x-auto custom-scroll">
        {QUICK_PROMPTS.slice(0, 3).map((p) => (
          <button
            key={p}
            onClick={() => sendMessage(p)}
            className="shrink-0 text-[10px] px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-slate-100 border border-slate-700 transition-colors whitespace-nowrap"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="flex gap-2 p-3 border-t border-slate-800">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Ask about encryption, IPFS, blockchain..."
          className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
        />
        <button
          onClick={() => sendMessage()}
          disabled={!input.trim() || loading}
          className="p-2.5 rounded-xl gradient-brand disabled:opacity-40 hover:scale-105 transition-transform"
        >
          <Send className="w-4 h-4 text-slate-950" />
        </button>
      </div>
    </div>
  );
}
