"use client";

import { useState } from "react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [status, setStatus] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("Submitting...");

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      setStatus(data.message || data.error || "Submitted!");
    } catch (err) {
      setStatus("Something went wrong. Please try again.");
    }
  };

  return (
    <main className="min-h-screen bg-slate-900 py-16 px-4 md:px-8 lg:px-16">
      <div className="max-w-3xl mx-auto bg-[#1b1b1b] shadow-lg rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-8 text-center text-[#ff6b6b]">
          Get in Touch
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block font-medium text-gray-300">
              Name
            </label>
            <input
              name="name"
              id="name"
              type="text"
              placeholder="Enter your name"
              onChange={handleChange}
              value={formData.name}
              className="mt-1 block w-full bg-[#2a2a2a] border border-gray-600 text-white placeholder-gray-400 rounded-md p-2 focus:ring-[#ff6b6b] focus:border-[#ff6b6b]"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block font-medium text-gray-300">
              Email
            </label>
            <input
              name="email"
              id="email"
              type="email"
              placeholder="Enter your email"
              onChange={handleChange}
              value={formData.email}
              className="mt-1 block w-full bg-[#2a2a2a] border border-gray-600 text-white placeholder-gray-400 rounded-md p-2 focus:ring-[#ff6b6b] focus:border-[#ff6b6b]"
              required
            />
          </div>

          <div>
            <label htmlFor="subject" className="block font-medium text-gray-300">
              Subject
            </label>
            <input
              name="subject"
              id="subject"
              type="text"
              placeholder="Enter the subject"
              onChange={handleChange}
              value={formData.subject}
              className="mt-1 block w-full bg-[#2a2a2a] border border-gray-600 text-white placeholder-gray-400 rounded-md p-2 focus:ring-[#ff6b6b] focus:border-[#ff6b6b]"
              required
            />
          </div>

          <div>
            <label htmlFor="message" className="block font-medium text-gray-300">
              Message
            </label>
            <textarea
              name="message"
              id="message"
              rows={5}
              placeholder="Enter the message you want to convey"
              onChange={handleChange}
              value={formData.message}
              className="mt-1 block w-full bg-[#2a2a2a] border border-gray-600 text-white placeholder-gray-400 rounded-md p-2 focus:ring-[#ff6b6b] focus:border-[#ff6b6b]"
              required
            />
          </div>

          <div className="text-center">
            <button
              type="submit"
              className="bg-[#ff6b6b] hover:bg-[#e85d5d] text-white font-semibold py-2 px-6 rounded transition"
            >
              Send Message
            </button>
          </div>

          {status && (
            <p className="text-center text-sm text-green-400 mt-2">{status}</p>
          )}
        </form>
      </div>
    </main>
  );
}
