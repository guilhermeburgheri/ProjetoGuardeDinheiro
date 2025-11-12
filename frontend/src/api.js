const API_URL = "http://localhost:3001";

export async function register(username, password) {
    const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
    });
    return res.json();
}

export async function login(username, password) {
    const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
    });
    return res.json();
}

export async function getExpenses(userId) {
    const res = await fetch(`${API_URL}/expenses/${userId}`);
    return res.json();
}

export async function addExpense(userId, description, amount, fixed, recurrence_type, months_duration) {
    const res = await fetch(`${API_URL}/expenses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, description, amount, fixed, recurrence_type, months_duration }),
    });
    return res.json();
}

export async function deleteExpense(id) {
  const res = await fetch(`${API_URL}/expenses/${id}`, { method: "DELETE" });
  return res.json();
}

export async function getSavings(userId) {
    const res = await fetch(`${API_URL}/savings/${userId}`);
    if (!res.ok) return null;
    try {
        return await res.json();
    } catch {
        return null;
    }
}

export async function setSavings(userId, goal_percentage, salary) {
    const res = await fetch(`${API_URL}/savings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, goal_percentage, salary }),
    });
    return res.json();
}

export async function getUsers(currentUser) {
  const res = await fetch(`${API_URL}/auth/users?username=${currentUser}`);
  return res.json();
}

export async function deleteUser(currentUser, id) {
  const res = await fetch(`${API_URL}/auth/users/${id}?username=${currentUser}`, { method: "DELETE" });
  return res.json();
}

