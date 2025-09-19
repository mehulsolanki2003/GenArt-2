// --- History Management ---

// Save entry to history (localStorage)
export function saveToHistory(imageUrl, prompt) {
  const history = JSON.parse(localStorage.getItem("history")) || [];
  const newEntry = {
    id: Date.now(),
    imageUrl,
    prompt,
    isFavorite: false,
    createdAt: new Date().toISOString()
  };

  history.unshift(newEntry); // add to beginning
  localStorage.setItem("history", JSON.stringify(history));
  renderHistory();
}

export function toggleHistoryAccess(user) {
  const historyLink = document.getElementById("history-link");
  const mobileHistoryLink = document.getElementById("mobile-history-link");

  if (user) {
    historyLink?.classList.remove("hidden");
    mobileHistoryLink?.classList.remove("hidden");
  } else {
    historyLink?.classList.add("hidden");
    mobileHistoryLink?.classList.add("hidden");
  }
}


// Render history in sidebar
export function renderHistory() {
  const container = document.getElementById("history-entries");
  if (!container) return;

  container.innerHTML = "";
  const history = JSON.parse(localStorage.getItem("history")) || [];

  if (history.length === 0) {
    container.innerHTML = `<p class="text-gray-500 text-center py-4">No history yet</p>`;
    return;
  }

  history.forEach(entry => {
    const item = document.createElement("div");
    item.className =
      "flex items-center gap-3 p-3 bg-white rounded-lg shadow border border-gray-200 hover:bg-gray-50";

    // Thumbnail
    const thumb = document.createElement("img");
    thumb.src = entry.imageUrl;
    thumb.alt = entry.prompt;
    thumb.className = "w-16 h-16 object-cover rounded";

    // Info
    const info = document.createElement("div");
    info.className = "flex-1 overflow-hidden";
    info.innerHTML = `
      <p class="text-sm font-medium text-gray-800 truncate">${entry.prompt}</p>
      <p class="text-xs text-gray-400">${new Date(entry.createdAt).toLocaleString()}</p>
    `;

    // Actions
    const actions = document.createElement("div");
    actions.className = "flex gap-2";

    // ⭐ Favorite
    const favBtn = document.createElement("button");
    favBtn.innerHTML = entry.isFavorite ? "⭐" : "☆";
    favBtn.title = "Favorite";
    favBtn.className = "text-yellow-500 hover:scale-110 transition";
    favBtn.onclick = () => toggleFavorite(entry.id);

    // 📋 Copy
    const copyBtn = document.createElement("button");
    copyBtn.innerHTML = "📋";
    copyBtn.title = "Copy Prompt";
    copyBtn.className = "hover:scale-110 transition";
    copyBtn.onclick = () => copyToClipboard(entry.prompt);

    // ❌ Delete
    const delBtn = document.createElement("button");
    delBtn.innerHTML = "❌";
    delBtn.title = "Delete";
    delBtn.className = "hover:scale-110 transition";
    delBtn.onclick = () => deleteFromHistory(entry.id);

    actions.append(favBtn, copyBtn, delBtn);

    item.append(thumb, info, actions);
    container.appendChild(item);
  });
}

// Toggle favorite
function toggleFavorite(id) {
  const history = JSON.parse(localStorage.getItem("history")) || [];
  const updated = history.map(entry =>
    entry.id === id ? { ...entry, isFavorite: !entry.isFavorite } : entry
  );
  localStorage.setItem("history", JSON.stringify(updated));
  renderHistory();
}

// Delete entry
function deleteFromHistory(id) {
  const history = JSON.parse(localStorage.getItem("history")) || [];
  const updated = history.filter(entry => entry.id !== id);
  localStorage.setItem("history", JSON.stringify(updated));
  renderHistory();
}

// Copy to clipboard
function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    alert("Prompt copied!");
  });
}

// Download history as JSON
export function downloadHistory() {
  const history = JSON.parse(localStorage.getItem("history")) || [];
  const blob = new Blob([JSON.stringify(history, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "history.json";
  a.click();
}

