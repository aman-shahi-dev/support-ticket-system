import { useState } from "react";
import {
  STATUSES,
  PRIORITY_STYLES,
  STATUS_STYLES,
} from "../constants/ticket_constants";
import { updateTicket } from "../api/tickets";

export default function TicketList({
  tickets,
  filters,
  onFiltersChange,
  onTicketUpdated,
}) {
  const [expandedId, setExpandedId] = useState(null);

  const handleStatusChange = async (ticket, newStatus) => {
    try {
      const updated = await updateTicket(ticket.id, { status: newStatus });
      onTicketUpdated(updated);
    } catch (error) {
      alert("Failed to update status");
    }
  };

  return (
    <div className="w-full md:w-1/2 bg-white rounded-xl shadow-2xl p-6">
      <h2 className="text-xl font-bold mb-4 text-center">
        All Tickets ({tickets?.length})
      </h2>

      <div className="flex flex-wrap gap-3 mb-5">
        <input
          placeholder="Search title or description..."
          value={filters?.search || ""}
          onChange={(e) =>
            onFiltersChange({ ...filters, search: e.target.value })
          }
          className="flex-1 min-w-48 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none"
        />
        <select
          value={filters?.category || ""}
          onChange={(e) =>
            onFiltersChange({ ...filters, category: e.target.value })
          }
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none"
        >
          <option value="">All Categories</option>
          {["billing", "technical", "account", "general"].map((c) => (
            <option key={c} value={c}>
              {c.charAt(0).toUpperCase() + c.slice(1)}
            </option>
          ))}
        </select>
        <select
          value={filters?.priority || ""}
          onChange={(e) =>
            onFiltersChange({ ...filters, priority: e.target.value })
          }
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none"
        >
          <option value="">All Priorities</option>
          {["low", "medium", "high", "critical"].map((p) => (
            <option key={p} value={p}>
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </option>
          ))}
        </select>
        <select
          value={filters?.status || ""}
          onChange={(e) =>
            onFiltersChange({ ...filters, status: e.target.value })
          }
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none"
        >
          <option value="">All Statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.replace("_", " ")}
            </option>
          ))}
        </select>
      </div>

      {tickets?.length === 0 && (
        <p className="text-center text-gray-400 py-10">No tickets found.</p>
      )}

      <div className="space-y-3">
        {tickets?.map((ticket) => (
          <div
            key={ticket.id}
            className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:shadow-sm transition-shadow"
            onClick={() =>
              setExpandedId(expandedId === ticket.id ? null : ticket.id)
            }
          >
            <div className="flex justify-between items-start mb-2">
              <span className="font-semibold text-gray-800">
                {ticket.title}
              </span>
              <div className="flex gap-2 ml-3 shrink-0">
                <span
                  className={`text-xs font-semibold px-2 py-1 rounded-full capitalize ${PRIORITY_STYLES[ticket.priority]}`}
                >
                  {ticket.priority}
                </span>
                <span className="text-xs font-semibold px-2 py-1 rounded-full capitalize bg-gray-100 text-gray-600">
                  {ticket.category}
                </span>
                <span
                  className={`text-xs font-semibold px-2 py-1 rounded-full capitalize ${STATUS_STYLES[ticket.status]}`}
                >
                  {ticket.status.replace("_", " ")}
                </span>
              </div>
            </div>

            <p className="text-sm text-gray-500 mb-3">
              {expandedId === ticket.id
                ? ticket.description
                : ticket.description.slice(0, 120) +
                  (ticket.description.length > 120 ? "..." : "")}
            </p>

            <div
              className="flex justify-between items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="text-xs text-gray-400">
                {new Date(ticket.created_at).toLocaleString()}
              </span>
              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-500">Status:</label>
                <select
                  value={ticket.status}
                  onChange={(e) => handleStatusChange(ticket, e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s.replace("_", " ")}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
