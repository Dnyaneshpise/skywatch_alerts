"use client";

import { useState } from "react";
import { Send, Loader2, MessageSquare } from "lucide-react";

type Status = {
    submitting: boolean;
    message: string;
    type: "success" | "error" | "";
};

export default function FeedbackPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [status, setStatus] = useState<Status>({ submitting: false, message: "", type: "" });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !message) {
            setStatus({ submitting: false, message: "Please include an email and message.", type: "error" });
            return;
        }

        setStatus({ submitting: true, message: "", type: "" });
        try {
            const res = await fetch("/api/feedback", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, message }),
            });
            const data = await res.json();
            if (res.ok) {
                setStatus({ submitting: false, message: data.message || "Thanks for your feedback!", type: "success" });
                setName("");
                setEmail("");
                setMessage("");
            } else {
                throw new Error(data.error || "Failed to send feedback");
            }
        } catch (err) {
            setStatus({ submitting: false, message: (err as Error).message || "Something went wrong.", type: "error" });
        }
    };

    return (
        <main className="min-h-screen bg-slate-900 py-16 px-4 md:px-8 lg:px-16">
            <div className="max-w-2xl mx-auto bg-slate-800 border border-cyan-400 shadow-lg rounded-2xl p-8 text-white">
                <h1 className="text-2xl font-bold mb-4 text-cyan-400 flex items-center gap-2">
                    <MessageSquare size={24} /> Send Feedback
                </h1>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm text-gray-300">Name (optional)</label>
                        <input id="name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full bg-slate-900 border border-slate-600 text-white rounded-md p-3 focus:ring-2 focus:ring-cyan-500/40" placeholder="Your name" />
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-sm text-gray-300">Email</label>
                        <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 block w-full bg-slate-900 border border-slate-600 text-white rounded-md p-3 focus:ring-2 focus:ring-cyan-500/40" placeholder="you@domain.com" required />
                    </div>

                    <div>
                        <label htmlFor="message" className="block text-sm text-gray-300">Message</label>
                        <textarea id="message" rows={6} value={message} onChange={(e) => setMessage(e.target.value)} className="mt-1 block w-full bg-slate-900 border border-slate-600 text-white rounded-md p-3 focus:ring-2 focus:ring-cyan-500/40" placeholder="Tell us what's on your mind" required />
                    </div>

                    <div>
                        <button type="submit" disabled={status.submitting} className="inline-flex items-center gap-2 bg-cyan-400 hover:bg-cyan-300 text-black font-semibold py-2 px-4 rounded-lg transition disabled:opacity-60">
                            {status.submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending...</> : <><Send className="h-4 w-4" /> Send feedback</>}
                        </button>
                    </div>

                    {status.message && (
                        <p className={`text-sm ${status.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>{status.message}</p>
                    )}
                </form>
            </div>
        </main>
    );
}
