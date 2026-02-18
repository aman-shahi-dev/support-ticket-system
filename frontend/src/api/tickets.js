const BASE = "/api/tickets";

// function for fetch the tickets
export async function fetchTickets(filters = {}) {
  const params = new URLSearchParams();
  if (filters.category) params.set("category", filters.category);
  if (filters.priority) params.set("priority", filters.priority);
  if (filters.status) params.set("status", filters.status);
  if (filters.search) params.set("search", filters.search);

  const response = await fetch(`${BASE}/${params.toString()}`);
  if (!response.ok) throw new Error("Failed to fetch tickets");
  return response.json();
}

// function to create a new ticket
export async function createTicket(data) {
  const response = await fetch(`${BASE}/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(JSON.stringify(error));
  }

  return response.json();
}

// function to update a ticket
export async function updateTicket(id, data) {
  const response = await fetch(`${BASE}/${id}/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) throw new Error("Failed to update ticket");
  return response.json();
}

// function to fetch the stats of tickets
export async function fetchStats() {
  const response = await fetch(`${BASE}/stats/`);
  if (!response.ok) throw new Error("Failed to fetch stats");
  return response.json();
}

// function to classify tickets
export async function classifyTicket(description) {
  const response = await fetch(`${BASE}/classify/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ description }),
  });
  if (!response.ok) throw Error("Classification failed");
  return response.json();
}
