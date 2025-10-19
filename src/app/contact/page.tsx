"use client";

import { useState } from "react";
import StarfieldBackground from '../../components/StarfieldBackground';
export default function ContactPage() {
  const initialFormData: FormData = {
    name: "",
    email: "",
    subject: "",
    topic: "",
    message: "",
  };

  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [status, setStatus] = useState<Status>({
    submitting: false,
    message: "",
    type: "",
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name as keyof FormData]) {
      setErrors({ ...errors, [name]: undefined });
    }
  };

  // (Validation logic remains the same)
  // ...
  const validateForm = (): boolean => {
    let newErrors: Partial<FormData> = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.name) newErrors.name = "Name is required.";
    if (!formData.email) {
      newErrors.email = "Email is required.";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address.";
    }
    if (!formData.subject) newErrors.subject = "Subject is required.";
    if (!formData.topic) newErrors.topic = "Please select a topic.";
    if (!formData.message) {
      newErrors.message = "Message is required.";
    } else if (formData.message.length < 10) {
      newErrors.message = "Message must be at least 10 characters long.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // (handleSubmit logic remains the same)
  // ...
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setStatus({ submitting: true, message: "", type: "" });
    setErrors({});
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus({
          submitting: false,
          message: data.message || "Feedback sent successfully!",
          type: "success",
        });
        setFormData(initialFormData);
      } else {
        throw new Error(data.error || "An error occurred.");
      }
    } catch (err) {
      setStatus({
        submitting: false,
        message:
          err instanceof Error ? err.message : "Something went wrong.",
        type: "error",
      });
    }
  };

  // **IMPROVEMENT 1: Added a stronger focus ring for better visual feedback**
  const getInputClasses = (fieldName: keyof FormData) =>
    `mt-1 block w-full bg-slate-900 border ${
      errors[fieldName]
        ? "border-red-500" // Red border on error
        : "border-slate-600 focus:border-cyan-400"
    } text-white placeholder-gray-400 rounded-md p-3 focus:ring-2 focus:ring-cyan-500/50 transition`; // <-- Added focus ring

  return (
    <>
    <StarfieldBackground />
    <main className="min-h-screen bg-slate-900 py-16 px-4 md:px-8 lg:px-16">
      <div className="max-w-3xl mx-auto bg-slate-800 border border-cyan-400 shadow-lg rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-8 text-center text-cyan-400 flex items-center justify-center gap-2">
          <MessageSquareText size={30} />
          Get in Touch
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* **IMPROVEMENT 2: Two-column grid for Name and Email** */}
          <div className="grid md:grid-cols-2 md:gap-6">
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
                className={getInputClasses("name")}
                aria-invalid={!!errors.name}
                aria-describedby="name-error"
                required
              />
              {errors.name && (
                <p id="name-error" className="text-red-400 text-sm mt-1">
                  {errors.name}
                </p>
              )}
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
                className={getInputClasses("email")}
                aria-invalid={!!errors.email}
                aria-describedby="email-error"
                required
              />
              {errors.email && (
                <p id="email-error" className="text-red-400 text-sm mt-1">
                  {errors.email}
                </p>
              )}
            </div>
          </div>

          {/* **IMPROVEMENT 3: Two-column grid for Subject and Topic** */}
          <div className="grid md:grid-cols-2 md:gap-6">
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
                className={getInputClasses("subject")}
                aria-invalid={!!errors.subject}
                aria-describedby="subject-error"
                required
              />
              {errors.subject && (
                <p id="subject-error" className="text-red-400 text-sm mt-1">
                  {errors.subject}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="topic" className="block font-medium text-gray-300">
                Topic
              </label>
              <select
                name="topic"
                id="topic"
                onChange={handleChange}
                value={formData.topic}
                className={getInputClasses("topic")}
                aria-invalid={!!errors.topic}
                aria-describedby="topic-error"
                required
              >
                <option value="">Select a topic</option>
                <option value="missed-alerts">Missed Alerts</option>
                <option value="alert-delay">Delay in Alerting</option>
                <option value="suggestions">
                  Suggestions for Improving the App
                </option>
                <option value="support">Support or Sponsorship</option>
                <option value="other">Other</option>
              </select>
              {errors.topic && (
                <p id="topic-error" className="text-red-400 text-sm mt-1">
                  {errors.topic}
                </p>
              )}
            </div>
          </div>

          {/* Message (remains full-width) */}
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
              placeholder="Enter your message (min. 10 characters)"
              onChange={handleChange}
              value={formData.message}
              className={getInputClasses("message")}
              aria-invalid={!!errors.message}
              aria-describedby="message-error"
              required
            />
            {errors.message && (
              <p id="message-error" className="text-red-400 text-sm mt-1">
                {errors.message}
              </p>
            )}
          </div>

          {/* **IMPROVEMENT 4: Full-width submit button** */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={status.submitting}
              className="inline-flex w-full items-center justify-center gap-2 bg-cyan-400 hover:bg-cyan-300 text-black font-semibold py-3 px-6 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed" // <-- Added w-full, justify-center, and more padding
            >
              {status.submitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  Send Message
                </>
              )}
            </button>
          </div>

          {/* Dynamic Status Message */}
          {status.message && (
            <p
              className={`text-center text-sm ${
                status.type === "success"
                  ? "text-green-400"
                  : "text-red-400"
              }`}
            >
              {status.message}
            </p>
          )}
        </form>
      </div>
    </main>
    </>
  );
}