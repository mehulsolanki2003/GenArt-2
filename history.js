// --- HISTORY SIDEBAR ---
// Manages history, favorites, search, copy, export/import, clear all

let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
let historyPrompts = JSON.parse(localStorage.getItem("genart-history")) || [];
let activeTab = "all";

// Render history/favorites
function renderHistory(prompts) {
  const historyList = document.getElementById("history-list");
  historyList.innerHTML = "";

  if (prompts.length === 0) {
    historyList.innerHTML = `<p class="text-gray-400 text-sm">No items found.</p>`;
    return;
  }

  prompts.forEach(entry => {
    const item = document.createElement("div");
    item.className =
      "flex justify-between items-center p-2 border rounded bg-gray-50 hover:bg-gray-100 transition";

    const text = document.createElement("span");
    text.className = "text-sm flex-1";
    text.textContent = entry.prompt || entry;

    const btnGroup = document.createElement("div");
    btnGroup.className = "flex items-center space-x-2";

    // ⭐ Favorite
    const favBtn = document.createElement("button");
    favBtn.textContent = favorites.includes(entry.prompt || entry) ? "⭐" : "☆";
    favBtn.className = "text-yellow-500";
    favBtn.addEventListener("click", () =>
      toggleFavorite(entry.prompt || entry, favBtn)
    );

    // 📋 Copy
    const copyBtn = document.createElement("button");
    copyBtn.textContent = "📋";
    copyBtn.className = "text-gray-500 hover:text-black";
    copyBtn.addEventListener("click", () =>
      copyToClipboard(entry.prompt || entry, copyBtn)
    );

    btnGroup.appendChild(favBtn);
    btnGroup.appendChild(copyBtn);

    item.appendChild(text);
    item.appendChild(btnGroup);
    historyList.appendChild(item);
  });
}

// Toggle favorite
function toggleFavorite(prompt, btn) {
  if (favorites.includes(prompt)) {
    favorites = favorites.filter(p => p !== prompt);
    btn.textContent = "☆";
  } else {
    favorites.push(prompt);
    btn.textContent = "⭐";
  }
  localStorage.setItem("favorites", JSON.stringify(favorites));
  if (activeTab === "favorites") renderHistory(favorites);
}

// 📋 Copy
function copyToClipboard(text, btn) {
  navigator.clipboard
    .writeText(text)
    .then(() => {
      btn.textContent = "✅";
      setTimeout(() => {
        btn.textContent = "📋";
      }, 1000);
    })
    .catch(err => {
      console.error("Failed to copy: ", err);
    });
}

// 🔍 Search
document.getElementById("history-search")?.addEventListener("input", e => {
  const searchText = e.target.value.toLowerCase();
  let filtered =
    activeTab === "favorites"
      ? favorites.filter(p => p.toLowerCase().includes(searchText))
      : historyPrompts
          .map(h => h.prompt || h)
          .filter(p => p.toLowerCase().includes(searchText));
  renderHistory(filtered.map(p => ({ prompt: p })));
});

// 🗑️ Clear All
document.getElementById("clear-history-btn")?.addEventListener("click", () => {
  if (confirm("Are you sure you want to clear all history? (Favorites will stay)")) {
    historyPrompts = [];
    localStorage.setItem("genart-history", JSON.stringify(historyPrompts));
    if (activeTab === "all") renderHistory(historyPrompts);
  }
});

// Tabs
document.getElementById("tab-all")?.addEventListener("click", () => {
  activeTab = "all";
  document.getElementById("tab-all").className =
    "flex-1 p-2 bg-blue-500 text-white rounded";
  document.getElementById("tab-favorites").className =
    "flex-1 p-2 bg-gray-200 text-gray-700 rounded";
  renderHistory(historyPrompts);
});

document.getElementById("tab-favorites")?.addEventListener("click", () => {
  activeTab = "favorites";
  document.getElementById("tab-favorites").className =
    "flex-1 p-2 bg-blue-500 text-white rounded";
  document.getElementById("tab-all").className =
    "flex-1 p-2 bg-gray-200 text-gray-700 rounded";
  renderHistory(favorites.map(p => ({ prompt: p })));
});

// 📂 Export JSON
document.getElementById("export-json-btn")?.addEventListener("click", () => {
  const data = { historyPrompts, favorites };
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json"
  });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "history_backup.json";
  a.click();

  URL.revokeObjectURL(url);
});

// 📂 Export CSV
document.getElementById("export-csv-btn")?.addEventListener("click", () => {
  let csvContent = "Prompt,Favorited\n";
  historyPrompts.forEach(entry => {
    const prompt = entry.prompt || entry;
    const isFavorite = favorites.includes(prompt) ? "Yes" : "No";
    csvContent += `"${prompt.replace(/"/g, '""')}",${isFavorite}\n`;
  });

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "history_backup.csv";
  a.click();

  URL.revokeObjectURL(url);
});

// 📥 Import JSON/CSV
document
  .getElementById("import-history-input")
  ?.addEventListener("change", event => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = e => {
      try {
        if (file.name.endsWith(".json")) {
          const importedData = JSON.parse(e.target.result);
          if (
            !Array.isArray(importedData.historyPrompts) ||
            !Array.isArray(importedData.favorites)
          ) {
            alert("❌ Invalid JSON format");
            return;
          }
          historyPrompts = [
            ...new Set([...historyPrompts, ...importedData.historyPrompts])
          ];
          favorites = [
            ...new Set([...favorites, ...importedData.favorites])
          ];
        } else if (file.name.endsWith(".csv")) {
          const lines = e.target.result.split("\n").slice(1);
          const importedPrompts = [];
          const importedFavorites = [];
          lines.forEach(line => {
            if (!line.trim()) return;
            const [prompt, fav] = line.split(
              /,(?=(?:[^"]*"[^"]*")*[^"]*$)/
            );
            const cleanPrompt = prompt
              .replace(/^"|"$/g, "")
              .replace(/""/g, '"')
              .trim();
            importedPrompts.push({ prompt: cleanPrompt });
            if (fav && fav.trim().toLowerCase() === "yes") {
              importedFavorites.push(cleanPrompt);
            }
          });
          historyPrompts = [
            ...new Set([...historyPrompts, ...importedPrompts])
          ];
          favorites = [...new Set([...favorites, ...importedFavorites])];
        } else {
          alert("❌ Unsupported file type.");
          return;
        }

        localStorage.setItem("genart-history", JSON.stringify(historyPrompts));
        localStorage.setItem("favorites", JSON.stringify(favorites));
        renderHistory(activeTab === "favorites" ? favorites : historyPrompts);
        alert("✅ History imported successfully!");
      } catch (err) {
        alert("❌ Error importing: " + err.message);
      }
    };
    reader.readAsText(file);
  });

// Sidebar open/close
document.getElementById("open-history-btn")?.addEventListener("click", () => {
  document.getElementById("history-sidebar").classList.remove("hidden");
});
document.getElementById("close-history-btn")?.addEventListener("click", () => {
  document.getElementById("history-sidebar").classList.add("hidden");
});

// Initial render
renderHistory(historyPrompts);
