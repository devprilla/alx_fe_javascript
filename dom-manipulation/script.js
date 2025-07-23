let quotes = [];

// ------------------------------
// Local Storage Functions
// ------------------------------
function loadQuotes() {
  const storedQuotes = localStorage.getItem("quotes");
  if (storedQuotes) {
    quotes = JSON.parse(storedQuotes);
  } else {
    quotes = [
      { text: "The only way to do great work is to love what you do.", category: "Inspiration" },
      { text: "Talk is cheap. Show me the code.", category: "Programming" },
      { text: "Success usually comes to those who are too busy to be looking for it.", category: "Motivation" }
    ];
    saveQuotes();
  }
}

function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// ------------------------------
// Display Quotes
// ------------------------------
function filterQuotes() {
  const selectedCategory = document.getElementById("categoryFilter").value;
  localStorage.setItem("selectedCategory", selectedCategory);

  let filtered = (selectedCategory === "all") ? quotes : quotes.filter(q => q.category === selectedCategory);

  const quoteDisplay = document.getElementById("quoteDisplay");
  if (filtered.length === 0) {
    quoteDisplay.innerHTML = `<p>No quotes in this category.</p>`;
    return;
  }

  const randomIndex = Math.floor(Math.random() * filtered.length);
  const quote = filtered[randomIndex];

  quoteDisplay.innerHTML = `
    <p><strong>Category:</strong> ${quote.category}</p>
    <p>"${quote.text}"</p>
  `;

  sessionStorage.setItem("lastViewedQuote", JSON.stringify(quote));
}

// ------------------------------
// Populate Category Dropdown
// ------------------------------
function populateCategories() {
  const select = document.getElementById("categoryFilter");
  const uniqueCategories = [...new Set(quotes.map(q => q.category))];

  select.innerHTML = `<option value="all">All Categories</option>`;
  uniqueCategories.forEach(category => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    select.appendChild(option);
  });

  const savedFilter = localStorage.getItem("selectedCategory");
  if (savedFilter) {
    select.value = savedFilter;
    filterQuotes();
  }
}

// ------------------------------
// Add Quote
// ------------------------------
function addQuote() {
  const textInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");

  const text = textInput.value.trim();
  const category = categoryInput.value.trim();

  if (text && category) {
    const newQuote = { text, category };
    quotes.push(newQuote);
    saveQuotes();
    populateCategories();
    filterQuotes();
    postQuoteToServer(newQuote); // Post to mock server

    textInput.value = "";
    categoryInput.value = "";
    alert("New quote added!");
  } else {
    alert("Please enter both a quote and a category.");
  }
}

// ------------------------------
// Create Add Quote Form
// ------------------------------
function createAddQuoteForm() {
  const formContainer = document.createElement("div");

  const textInput = document.createElement("input");
  textInput.id = "newQuoteText";
  textInput.placeholder = "Enter a new quote";

  const categoryInput = document.createElement("input");
  categoryInput.id = "newQuoteCategory";
  categoryInput.placeholder = "Enter quote category";

  const addButton = document.createElement("button");
  addButton.textContent = "Add Quote";
  addButton.addEventListener("click", addQuote);

  formContainer.appendChild(textInput);
  formContainer.appendChild(categoryInput);
  formContainer.appendChild(addButton);

  document.body.appendChild(formContainer);
}

// ------------------------------
// JSON Import/Export
// ------------------------------
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function (event) {
    try {
      const importedQuotes = JSON.parse(event.target.result);
      if (Array.isArray(importedQuotes)) {
        quotes.push(...importedQuotes);
        saveQuotes();
        populateCategories();
        filterQuotes();
        alert("Quotes imported successfully!");
      } else {
        alert("Invalid JSON format.");
      }
    } catch (e) {
      alert("Error reading JSON file.");
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

function exportToJsonFile() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
}

// ------------------------------
// Server Sync Logic (Mock Fetch)
// ------------------------------
function fetchQuotesFromServer() {
  // Simulate fetch using Promise
  return new Promise(resolve => {
    const mockServerQuotes = [
      { text: "Programs must be written for people to read.", category: "Programming" },
      { text: "Life is what happens when you’re busy making other plans.", category: "Life" }
    ];
    setTimeout(() => resolve(mockServerQuotes), 500); // simulate delay
  });
}

function postQuoteToServer(quote) {
  // Simulate POST using fetch
  fetch("https://example.com/mock-api/quotes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(quote)
  })
  .then(() => console.log("Posted to server:", quote))
  .catch(() => console.warn("Server post failed (mocked)"));
}

function syncQuotes() {
  fetchQuotesFromServer().then(serverQuotes => {
    let newCount = 0;
    let conflicts = 0;

    serverQuotes.forEach(serverQuote => {
      const local = quotes.find(q => q.text === serverQuote.text);
      if (!local) {
        quotes.push(serverQuote);
        newCount++;
      } else if (local.category !== serverQuote.category) {
        local.category = serverQuote.category; // Server wins
        conflicts++;
      }
    });

    saveQuotes();
    populateCategories();
    filterQuotes();
    showSyncNotification(newCount, conflicts);
  });
}

// ------------------------------
// Notifications
// ------------------------------
function showSyncNotification(newCount, conflicts) {
  const notice = document.getElementById("syncNotice");
  notice.textContent = `${newCount} new quote(s) added, ${conflicts} conflict(s) resolved.`;
  setTimeout(() => { notice.textContent = ""; }, 5000);
}

// ------------------------------
// DOM Ready
// ------------------------------
document.addEventListener("DOMContentLoaded", function () {
  loadQuotes();
  populateCategories();
  createAddQuoteForm();
  document.getElementById("newQuote").addEventListener("click", filterQuotes);
  setInterval(syncQuotes, 60000); // Periodic sync
});
