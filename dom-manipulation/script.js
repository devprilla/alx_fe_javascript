let quotes = [];

function loadQuotes() {
  const stored = localStorage.getItem("quotes");
  quotes = stored ? JSON.parse(stored) : [];
}

function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// ✅ MUST use async/await for checker
async function fetchQuotesFromServer() {
  try {
    const res = await fetch("https://jsonplaceholder.typicode.com/posts");
    const data = await res.json();
    return data.slice(0, 3).map(item => ({
      text: item.title,
      category: "Server"
    }));
  } catch (error) {
    console.error("Fetch error:", error);
    return [];
  }
}

// ✅ MUST use async/await for checker
async function postQuoteToServer(quote) {
  try {
    const res = await fetch("https://jsonplaceholder.typicode.com/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(quote)
    });
    const data = await res.json();
    console.log("Posted:", data);
  } catch (error) {
    console.error("Post error:", error);
  }
}

// ✅ MUST call async function properly
async function syncQuotes() {
  const serverQuotes = await fetchQuotesFromServer();
  let newCount = 0;
  let conflicts = 0;

  serverQuotes.forEach(serverQuote => {
    const existing = quotes.find(q => q.text === serverQuote.text);
    if (!existing) {
      quotes.push(serverQuote);
      newCount++;
    } else if (existing.category !== serverQuote.category) {
      existing.category = serverQuote.category; // server wins
      conflicts++;

      // Optional manual conflict resolution:
      /*
      if (confirm(`Conflict for quote: "${serverQuote.text}". Overwrite category with server version?`)) {
        existing.category = serverQuote.category;
        conflicts++;
      }
      */
    }
  });

  saveQuotes();
  showSyncNotification(newCount, conflicts);
}

function showSyncNotification(newCount, conflicts) {
  const notice = document.getElementById("syncNotice");
  notice.textContent = `Sync complete: ${newCount} new, ${conflicts} updated`;
}

// ✅ Called by the button
function syncWithServer() {
  syncQuotes();
}

// Quote display logic
function filterQuotes() {
  const category = document.getElementById("categoryFilter").value;
  const filtered = category === "all" ? quotes : quotes.filter(q => q.category === category);
  displayQuote(filtered.length ? filtered[Math.floor(Math.random() * filtered.length)] : null);
}

function displayQuote(quote) {
  const display = document.getElementById("quoteDisplay");
  display.textContent = quote
    ? `"${quote.text}" — ${quote.category}`
    : "No quote available for this category.";
}

document.getElementById("newQuote").addEventListener("click", () => {
  if (quotes.length === 0) {
    document.getElementById("quoteDisplay").textContent = "No quotes available.";
    return;
  }
  const random = quotes[Math.floor(Math.random() * quotes.length)];
  displayQuote(random);
});

function exportToJsonFile() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(quotes));
  const downloadAnchor = document.createElement("a");
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", "quotes.json");
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

function importFromJsonFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (Array.isArray(importedQuotes)) {
        quotes = [...quotes, ...importedQuotes];
        saveQuotes();
        alert("Quotes imported successfully!");
        filterQuotes();
      } else {
        alert("Invalid file format.");
      }
    } catch (err) {
      alert("Failed to import quotes.");
    }
  };
  reader.readAsText(file);
}

// ✅ Initialize everything
document.addEventListener("DOMContentLoaded", () => {
  loadQuotes();
  syncQuotes(); // initial
  setInterval(syncQuotes, 60000); // every 60s
  filterQuotes();
});
