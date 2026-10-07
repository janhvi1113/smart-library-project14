const API_BASE = "/api";
async function readJsonResponse(response, fallback = []) {
  const text = await response.text();

  console.log(
    "API:",
    response.url,
    "STATUS:",
    response.status,
    "BODY:",
    text
  );

  if (!response.ok) {
    throw new Error(
      text || `Request failed with status ${response.status}`
    );
  }

  if (!text || !text.trim()) {
    return fallback;
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    console.error(
      "Invalid JSON response from:",
      response.url,
      text
    );

    throw new Error(
      "Server returned invalid JSON"
    );
  }
}

export async function getDemandDashboard() {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API_BASE}/demand/dashboard`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  if (!response.ok) {
    throw new Error(
      "Failed to load demand dashboard"
    );
  }

  return response.json();
}

export async function getBooks() {
  const response = await fetch(
    `${API_BASE}/books`
  );

  if (!response.ok) {
    throw new Error(
      "Failed to load books"
    );
  }

  return response.json();
}

export async function login(
  email,
  password
) {
  const response = await fetch(
    `${API_BASE}/auth/login?email=${encodeURIComponent(
      email
    )}&password=${encodeURIComponent(
      password
    )}`,
    {
      method: "POST"
    }
  );

  if (!response.ok) {
    throw new Error(
      "Invalid email or password"
    );
  }

  return response.json();
}

export async function registerUser(
  name,
  email,
  password
) {
  const response = await fetch(
    `${API_BASE}/users`,
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json"
      },
      body: JSON.stringify({
        name,
        email,
        password
      })
    }
  );

  const text =
    await response.text();

  if (!response.ok) {
    throw new Error(
      text || "Registration failed"
    );
  }

  return JSON.parse(text);
}

export async function createReservation(
  bookId
) {
  const token =
    localStorage.getItem("token");

  const response = await fetch(
    `${API_BASE}/reservations?bookId=${bookId}`,
    {
      method: "POST",
      headers: {
        Authorization:
          `Bearer ${token}`
      }
    }
  );

  const text =
    await response.text();

  if (!response.ok) {
    throw new Error(
      text ||
      "Failed to create reservation"
    );
  }

  return JSON.parse(text);
}

export async function getMyReservations() {
  const token = localStorage.getItem("token");

  const user = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  if (!user.id) {
    throw new Error(
      "User information not found"
    );
  }

  const response = await fetch(
    `${API_BASE}/reservations/user/${user.id}`,
    {
      method: "GET",
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json"
      }
    }
  );

  return readJsonResponse(response, []);
}
export async function getBookReservations(
  bookId
) {
  const token =
    localStorage.getItem("token");

  const response = await fetch(
    `${API_BASE}/reservations/book/${bookId}`,
    {
      headers: {
        Authorization:
          `Bearer ${token}`
      }
    }
  );

  const text =
    await response.text();

  if (!response.ok) {
    throw new Error(
      text ||
      "Failed to load reservation queue"
    );
  }

  return JSON.parse(text);
}

export async function getMyLoans() {
  const token = localStorage.getItem("token");

  const user = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  if (!user.id) {
    throw new Error("User information not found");
  }

  const response = await fetch(
    `${API_BASE}/circulation/user/${user.id}`,
    {
      method: "GET",
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json"
      }
    }
  );

  return readJsonResponse(response, []);
}
export async function borrowBook(
  bookId
) {
  const token =
    localStorage.getItem("token");

  const response = await fetch(
    `${API_BASE}/circulation/borrow?bookId=${bookId}`,
    {
      method: "POST",
      headers: {
        Authorization:
          `Bearer ${token}`
      }
    }
  );

  const text =
    await response.text();

  if (!response.ok) {
    throw new Error(
      text ||
      "Failed to borrow book"
    );
  }

  return JSON.parse(text);
}

export async function returnStudentBook(
  circulationId
) {
  const token =
    localStorage.getItem("token");

  const response = await fetch(
    `${API_BASE}/circulation/return/student/${circulationId}`,
    {
      method: "POST",
      headers: {
        Authorization:
          `Bearer ${token}`
      }
    }
  );

  const text =
    await response.text();

  if (!response.ok) {
    throw new Error(
      text ||
      "Failed to return book"
    );
  }

  return JSON.parse(text);
}

export async function getUsers() {
  const token =
    localStorage.getItem("token");

  const response = await fetch(
    `${API_BASE}/users`,
    {
      headers: {
        Authorization:
          `Bearer ${token}`
      }
    }
  );

  const text =
    await response.text();

  if (!response.ok) {
    throw new Error(
      text ||
      "Failed to load users"
    );
  }

  return JSON.parse(text);
}

export async function getBookCopies(
  bookId
) {
  const token =
    localStorage.getItem("token");

  const response = await fetch(
    `${API_BASE}/books/${bookId}/copies`,
    {
      headers: {
        Authorization:
          `Bearer ${token}`
      }
    }
  );

  const text =
    await response.text();

  if (!response.ok) {
    throw new Error(
      text ||
      "Failed to load book copies"
    );
  }

  return JSON.parse(text);
}

export async function issueBook(
  userId,
  bookCopyId,
  dueDate,
  reservationId
) {
  const token =
    localStorage.getItem("token");

  const params =
    new URLSearchParams({
      userId: userId,
      bookCopyId: bookCopyId,
      dueDate: dueDate
    });

  if (reservationId) {
    params.append(
      "reservationId",
      reservationId
    );
  }

  const response = await fetch(
    `${API_BASE}/circulation/issue?${params.toString()}`,
    {
      method: "POST",
      headers: {
        Authorization:
          `Bearer ${token}`
      }
    }
  );

  const text =
    await response.text();

  if (!response.ok) {
    throw new Error(
      text ||
      "Failed to issue book"
    );
  }

  return JSON.parse(text);
}

export async function returnBook(
  circulationId
) {
  const token =
    localStorage.getItem("token");

  const response = await fetch(
    `${API_BASE}/circulation/return/${circulationId}`,
    {
      method: "POST",
      headers: {
        Authorization:
          `Bearer ${token}`
      }
    }
  );

  const text =
    await response.text();

  if (!response.ok) {
    throw new Error(
      text ||
      "Failed to return book"
    );
  }

  return JSON.parse(text);
}

export async function getAllCirculation() {
  const token =
    localStorage.getItem("token");

  const response = await fetch(
    `${API_BASE}/circulation`,
    {
      headers: {
        Authorization:
          `Bearer ${token}`
      }
    }
  );

  const text =
    await response.text();

  if (!response.ok) {
    throw new Error(
      text ||
      "Failed to load circulation"
    );
  }

  return JSON.parse(text);
}
export async function getAcquisitionSuggestions() {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_BASE}/acquisition/suggestions`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const text = await response.text();

  if (!response.ok) {
    throw new Error(text || "Failed to load acquisition suggestions");
  }

  return JSON.parse(text);
}
export async function getNotifications() {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API_BASE}/notifications`,
    {
      method: "GET",
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json"
      }
    }
  );

  return readJsonResponse(response, []);
}
export async function addBook(book) {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_BASE}/book-management/books`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(book)
  });

  const text = await response.text();

  if (!response.ok) {
    throw new Error(text || "Failed to add book");
  }

  return JSON.parse(text);
}

export async function addBookCopies(bookId, quantity) {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API_BASE}/book-management/books/${bookId}/copies?quantity=${quantity}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  const text = await response.text();

  if (!response.ok) {
    throw new Error(text || "Failed to add copies");
  }

  return text;
}

export async function updateBook(bookId, book) {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API_BASE}/book-management/books/${bookId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(book)
    }
  );

  const text = await response.text();

  if (!response.ok) {
    throw new Error(text || "Failed to update book");
  }

  return JSON.parse(text);
}
export async function sendReminder(userId, title, message) {
  const token = localStorage.getItem("token");

  const params = new URLSearchParams({
    userId: String(userId),
    title,
    message
  });

  const response = await fetch(
    `${API_BASE}/reminders?${params.toString()}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  const text = await response.text();

  if (!response.ok) {
    throw new Error(
      text || "Failed to send reminder"
    );
  }

  return JSON.parse(text);
}

export async function getMyReminders() {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API_BASE}/reminders/my`,
    {
      method: "GET",
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json"
      }
    }
  );

  return readJsonResponse(response, []);
}
export async function markReminderAsRead(id) {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API_BASE}/reminders/${id}/read`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  const text = await response.text();

  if (!response.ok) {
    throw new Error(
      text || "Failed to mark reminder as read"
    );
  }

  return JSON.parse(text);
}
export async function getMyChatMessages() {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API_BASE}/chat/my`,
    {
      method: "GET",
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json"
      }
    }
  );

  return readJsonResponse(response, []);
}

export async function sendChatMessage(
  receiverId,
  message
) {
  const token = localStorage.getItem("token");

  const params = new URLSearchParams({
    receiverId: String(receiverId),
    message
  });

  const response = await fetch(
    `${API_BASE}/chat?${params.toString()}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  const text = await response.text();

  if (!response.ok) {
    throw new Error(
      text || "Failed to send message"
    );
  }

  return JSON.parse(text);
}

export async function getChatStudents() {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API_BASE}/chat/students`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  const text = await response.text();

  if (!response.ok) {
    throw new Error(
      text || "Failed to load students"
    );
  }

  return JSON.parse(text);
}

export async function getAllChatMessages() {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API_BASE}/chat/all`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  const text = await response.text();

  if (!response.ok) {
    throw new Error(
      text || "Failed to load chat messages"
    );
  }

  return JSON.parse(text);
}

export async function markChatMessageAsRead(id) {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API_BASE}/chat/${id}/read`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  const text = await response.text();

  if (!response.ok) {
    throw new Error(
      text || "Failed to mark message as read"
    );
  }

  return JSON.parse(text);
}
export async function semanticSearchBooks(query) {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API_BASE}/semantic-search?query=${encodeURIComponent(query)}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    }
  );

  const text = await response.text();

  if (!response.ok) {
    throw new Error(text || "Semantic search failed.");
  }

  const data = JSON.parse(text);

  return Array.isArray(data) ? data : data.results || [];
}
export async function sendAIMessage(message) {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API_BASE}/ai/chat?message=${encodeURIComponent(message)}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json"
      }
    }
  );

  const text = await response.text();

  console.log(
    "AI API:",
    response.url,
    "STATUS:",
    response.status,
    "BODY:",
    text
  );

  if (!response.ok) {
    throw new Error(
      text || "AI assistant failed."
    );
  }

  if (!text || !text.trim()) {
    throw new Error(
      "AI service returned an empty response."
    );
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    console.error(
      "Invalid AI JSON response:",
      text
    );

    throw new Error(
      "AI assistant returned invalid JSON."
    );
  }
}