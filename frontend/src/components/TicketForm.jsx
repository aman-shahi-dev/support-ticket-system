import { useState, useRef } from "react";
import { createTicket, classifyTicket } from "../api/tickets";
import { CATEGORIES, PRIORITIES } from "../constants/ticket_constants";

export default function TicketForm({ onTicketCreated }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    priority: "",
  });
  const [classifying, setClassifying] = useState(false);
  const [suggestion, setSuggestion] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const classifyTimer = useRef(null);

  const handleDescriptionChange = (e) => {
    const value = e.target.value;
    setForm((formData) => ({ ...formData, description: value }));
    setSuggestion(null);

    if (classifyTimer.current) clearTimeout(classifyTimer.current);
    if (value.trim().length < 20) return;

    classifyTimer.current = setTimeout(async () => {
      setClassifying(true);
      try {
        const result = await classifyTicket(value);
        setSuggestion(result);
        setForm((formData) => ({
          ...formData,
          category: formData.category || result.suggested_category,
          priority: formData.priority || result.suggested_priority,
        }));
      } catch {
        // silent fail
      } finally {
        setClassifying(false);
      }
    }, 800);
  };

  const handleChange = (e) => {
    setForm((formData) => ({ ...formData, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.category || !form.priority) {
      setError("Please select a category and priority");
      return;
    }
    setSubmitting(true);
    try {
      const ticket = await createTicket(form);
      onTicketCreated(ticket);
      setForm({ title: "", description: "", category: "", priority: "" });
      setSuggestion(null);
    } catch (error) {
      setError(error.message || "Failed to create ticket");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full md:w-1/3 h-1/2 bg-white flex rounded-xl shadow-2xl p-6 flex-col">
      <h2 className="text-xl font-bold mb-4 text-center w-full">
        Submit a Support Ticket
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Title *
          </label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            maxLength={200}
            placeholder="Brief summary of the issue"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Description *
            {classifying && (
              <span className="ml-2 text-xs text-gray-400 font-normal">
                AI classifying...
              </span>
            )}
            {!classifying && suggestion && (
              <span className="ml-2 text-xs text-green-500 font-normal">
                AI suggestion applied ✅
              </span>
            )}
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleDescriptionChange}
            required
            rows={4}
            placeholder="Describe the issue in detail..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-y focus:outline-none"
          ></textarea>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Category *
              {suggestion && (
                <span className="ml-2 text-xs text-green-500 font-normal">
                  (AI: {suggestion.suggested_category})
                </span>
              )}
            </label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none"
            >
              <option value="">Select category</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Priority *
              {suggestion && (
                <span className="ml-2 text-xs text-green-500 font-normal">
                  (AI: {suggestion.suggested_priority})
                </span>
              )}
            </label>
            <select
              name="priority"
              value={form.priority}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none"
            >
              <option value="">Select priority</option>
              {PRIORITIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="bg-amber-500 text-white px-6 py-2 rounded-full font-semibold text-sm hover:bg-amber-600 disabled:opacity-60 transition-colors col-span-2 w-fit mx-auto cursor-pointer mt-2"
          >
            {submitting ? "Submitting..." : "Submit Ticket"}
          </button>
        </div>
      </form>
    </div>
  );
}
