import { useState, useEffect, useCallback } from "react";
import StatsDashboard from "./components/StatsDashboard";
import TicketForm from "./components/TicketForm";
import TicketList from "./components/TicketList";
import { fetchTickets, fetchStats } from "./api/tickets";

export default function App() {
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState(null);
  const [filters, setFilters] = useState({});
  const [loading, setLoading] = useState(true);

  const loadTickets = useCallback(async () => {
    try {
      const data = await fetchTickets(filters);
      setTickets(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      console.error("Failed to load tickets:", err);
    }
  }, [filters]);

  const loadStats = useCallback(async () => {
    try {
      const data = await fetchStats();
      setStats(data);
    } catch (err) {
      console.error("Failed to load stats:", err);
    }
  }, []);

  useEffect(() => {
    Promise.all([loadTickets(), loadStats()]).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadTickets();
  }, [filters]);

  const handleTicketCreated = (newTicket) => {
    setTickets((prev) => [newTicket, ...prev]);
    loadStats();
  };

  const handleTicketUpdated = (updatedTicket) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === updatedTicket.id ? updatedTicket : t)),
    );
    loadStats();
  };

  return (
    <div className="min-h-screen flex flex-col bg-blue-200 text-black items-center justify-center font-inter p-3">
      <header className="bg-orange-500 rounded text-white px-8 py-5 shadow-2xl mb-10">
        <h1 className="text-2xl font-bold">Support Ticket System</h1>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-evenly">
        {loading ? (
          <p className="text-center text-gray-400 py-20">Loading...</p>
        ) : (
          <>
            <StatsDashboard stats={stats} />
            <TicketForm onTicketCreated={handleTicketCreated} />
            <TicketList
              tickets={tickets}
              filters={filters}
              onFiltersChange={setFilters}
              onTicketUpdated={handleTicketUpdated}
            />
          </>
        )}
      </main>
    </div>
  );
}
