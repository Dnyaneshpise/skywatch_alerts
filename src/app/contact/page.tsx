"use client";

import { useState } from "react";
import StarfieldBackground from '../../components/StarfieldBackground';
export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    topic: "",
    message: "",
  });

  const [status, setStatus] = useState("");

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
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
      setFormData({
        name: "",
        email: "",
        subject: "",
        topic: "",
        message: "",
      });
    } catch (err) {
      setStatus("Something went wrong. Please try again.");
    }
  };

  return (
    <>
    <StarfieldBackground />
    <main className="min-h-screen bg-slate-900 py-16 px-4 md:px-8 lg:px-16">
      <div className="max-w-3xl mx-auto bg-slate-800 border border-cyan-400 shadow-lg rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-8 text-center text-[#22d3ee]">
          Get in Touch
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
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
              className="mt-1 block w-full bg-slate-900 border border-slate-600 text-white placeholder-gray-400 rounded-md p-3 focus:ring-cyan-400 focus:border-cyan-400 transition"
              required
            />
          </div>

          {/* Email */}
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
              className="mt-1 block w-full bg-slate-900 border border-slate-600 text-white placeholder-gray-400 rounded-md p-3 focus:ring-cyan-400 focus:border-cyan-400 transition"
              required
            />
          </div>

          {/* Subject */}
          <div>
            <label
              htmlFor="subject"
              className="block font-medium text-gray-300"
            >
              Subject
            </label>
            <input
              name="subject"
              id="subject"
              type="text"
              placeholder="Enter the subject"
              onChange={handleChange}
              value={formData.subject}
              className="mt-1 block w-full bg-slate-900 border border-slate-600 text-white placeholder-gray-400 rounded-md p-3 focus:ring-cyan-400 focus:border-cyan-400 transition"
              required
            />
          </div>

          {/* Topic Dropdown */}
          <div>
            <label htmlFor="topic" className="block font-medium text-gray-300">
              Topic
            </label>
            <select
              name="topic"
              id="topic"
              onChange={handleChange}
              className="mt-1 block w-full bg-slate-900 border border-slate-600 text-white rounded-md p-3 focus:ring-cyan-400 focus:border-cyan-400 transition"
              required
            >
              <option value="">Select a topic</option>
              <option value="missed-alerts">Missed Alerts</option>
              <option value="alert-delay">Delay in Alerting</option>
              <option value="suggestions">
                Suggestions for Improving the App
              </option>
              <option value="support">Support or Sponsorship</option>
            </select>
          </div>

          {/* Message */}
          <div>
            <label
              htmlFor="message"
              className="block font-medium text-gray-300"
            >
              Message
            </label>
            <textarea
              name="message"
              id="message"
              rows={5}
              placeholder="Enter your message"
              onChange={handleChange}
              value={formData.message}
              className="mt-1 block w-full bg-slate-900 border border-cyan-400 text-white placeholder-gray-400 rounded-md p-3 focus:ring-cyan-400 focus:border-cyan-400 transition"
              required
            />
          </div>

          {/* Submit Button */}
          <div className="text-center">
            <button
              type="submit"
              disabled={status === "Submitting..."}
              className="bg-cyan-400 hover:bg-cyan-300 text-black font-semibold py-2 px-6 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === "Submitting..." ? "Sending..." : "Send Message"}
            </button>
          </div>

          {/* Status Message */}
          {status && (
            <p className="text-center text-sm text-green-400 mt-2">{status}</p>
          )}
        </form>
      </div>
    </main>
    </>
  );
}
