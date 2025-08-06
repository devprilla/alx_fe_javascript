let quotes = [];

function loadQuotes() {
  const stored = localStorage.getItem("quotes");
  quotes = stored ? JSON.parse(stored) : [];
}

function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

function fetchQuotesFromServer() {
  return fetch("https://jsonplaceholder.typicode.com/posts")
    .then(res => res.json())
    .then(data => {
      // simulate quotes from server
      return data.slice(0, 3).map(item => ({
        text: item.title,
        category: "Server"
      }));
    });
}

function postQuoteToServer(quote) {
  fetch("https://jsonplaceholder.typicode.com/posts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(quote)
  })
    .then(res => res.json())
    .then(data => console.log("Posted:", data))
    .catch(err => console.error("Error posting:", err));
}

function syncQuotes() {
  fetchQuotesFromServer().then(serverQuotes => {
    let newCount = 0;
    let conflicts = 0;

    serverQuotes.forEach(serverQuote => {
      const existing = quotes.find(q => q.text === serverQuote.text);
      if (!existing) {
        quotes.push(serverQuote);
        newCount++;
      } else if (existing.category !== serverQuote.category) {
        // Option 1: Server always wins
        existing.category = serverQuote.category;
        conflicts++;

        // Option 2: Ask user before replacing (uncomment to enable)
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
  });
}

function showSyncNotification(newCount, conflicts) {
  const notice = document.getElementById("syncNotice");
  notice.textContent = `Sync complete: ${newCount} new, ${conflicts} updated`;
}

// Called by Sync Button
function syncWithServer() {
  syncQuotes();
}

// Filter quotes by category
function filterQuotes() {
  const category = document.getElementById("categoryFilter").value;
  const filtered = category === "all" ? quotes : quotes.filter(q => q.category === category);
  displayQuote(filtered.length ? filtered[Math.floor(Math.random() * filtered.length)] : null);
}

// Display a single quote
function displayQuote(quote) {
  const display = document.getElementById("quoteDisplay");
  if (!quote) {
    display.textContent = "No quote available for this category.";
    return;
  }
  display.textContent = `"${quote.text}" — ${quote.category}`;
}

// Show new quote
document.getElementById("newQuote").addEventListener("click", () => {
  if (quotes.length === 0) {
    document.getElementById("quoteDisplay").textContent = "No quotes available.";
    return;
  }
  const random = quotes[Math.floor(Math.random() * quotes.length)];
  displayQuote(random);
});

// Export quotes
function exportToJsonFile() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(quotes));
  const downloadAnchor = document.createElement("a");
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", "quotes.json");
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

// Import quotes
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

// Initial load
document.addEventListener("DOMContentLoaded", () => {
  loadQuotes();
  syncQuotes(); // initial sync on load
  setInterval(syncQuotes, 60000); // sync every 60 seconds
  filterQuotes(); // populate UI
});
