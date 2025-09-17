// --- Firebase Imports ---
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

const auth = getAuth();

// --- DOM Elements ---
const historySidebar = document.getElementById("history-sidebar");
const openHistoryBtn = document.getElementById("open-history-btn");
const closeHistoryBtn = document.getElementById("close-history-btn");
const historyList = document.getElementById("history-list");
const exportJsonBtn = document.getElementById("export-json");
const filterHistory = document.getElementById("filter-history");
const searchHistory = document.getElementById("search-history");

let userHistory = [];

// ----------------------
// 🔥 Save new history item
// ----------------------
export function saveToHistory(imageUrl, prompt) {
  const history = JSON.parse(localStorage.getItem("genart-history")) || [];
  history.unshift({
    image: imageUrl,
    prompt: prompt,
    favorite: false,
    date: new Date().toISOString(),
  });
  localStorage.setItem("genart-history", JSON.stringify(history));
}

// ----------------------
// 🖼 Render History UI
// ----------------------
function renderHistory() {
  if (!auth.currentUser) {
    historyList.innerHTML = `<p class="text-gray-400 text-center text-sm">Sign in to view history.</p>`;
    return;
  }

  userHistory = JSON.parse(localStorage.getItem("genart-history")) || [];
  let filtered = [...userHistory];

  // filter favorites
  if (filterHistory.value === "favorites") {
    filtered = filtered.filter((h) => h.favorite);
  }

  // search filter
  const query = searchHistory.value.toLowerCase();
  if (query) {
    filtered = filtered.filter((h) => h.prompt.toLowerCase().includes(query));
  }

  if (filtered.length === 0) {
    historyList.innerHTML = `<p class="text-gray-400 text-center text-sm">No history found.</p>`;
    return;
  }

  historyList.innerHTML = "";
  filtered.forEach((item, idx) => {
    const div = document.createElement("div");
    div.className =
      "border rounded-lg p-2 flex gap-2 items-start hover:bg-gray-50";

    div.innerHTML = `
      <img src="${item.image}" alt="History Image" class="w-16 h-16 object-cover rounded">
      <div class="flex-1">
        <p class="font-medium">${item.prompt}</p>
        <p class="text-xs text-gray-500">${new Date(item.date).toLocaleString()}</p>
      </div>
      <button class="favorite-btn text-xl ${
        item.favorite ? "text-yellow-500" : "text-gray-400"
      }">★</button>
    `;

    // toggle favorite
    div.querySelector(".favorite-btn").addEventListener("click", () => {
      userHistory[idx].favorite = !userHistory[idx].favorite;
      localStorage.setItem("genart-history", JSON.stringify(userHistory));
      renderHistory();
    });

    historyList.appendChild(div);
  });
}

// ----------------------
// 📂 Export JSON
// ----------------------
function exportHistory() {
  if (!auth.currentUser) {
    alert("Please log in to download history.");
    return;
  }
  const dataStr =
    "data:text/json;charset=utf-8," +
    encodeURIComponent(JSON.stringify(userHistory, null, 2));
  const dlAnchor = document.createElement("a");
  dlAnchor.setAttribute("href", dataStr);
  dlAnchor.setAttribute("download", "genart-history.json");
  dlAnchor.click();
}

// ----------------------
// 🎯 Event Listeners
// ----------------------
openHistoryBtn?.addEventListener("click", () => {
  historySidebar.classList.remove("hidden");
  renderHistory();
});

closeHistoryBtn?.addEventListener("click", () =>
  historySidebar.classList.add("hidden")
);

exportJsonBtn?.addEventListener("click", exportHistory);
searchHistory?.addEventListener("input", renderHistory);
filterHistory?.addEventListener("change", renderHistory);

// ----------------------
// 👤 Auth State Handling
// ----------------------
onAuthStateChanged(auth, (user) => {
  if (user) {
    renderHistory();
  } else {
    historyList.innerHTML = `<p class="text-gray-400 text-center text-sm">Sign in to view history.</p>`;
  }
});
