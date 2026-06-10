
let trips = [];
let currentTripId = "";
let spendingChart = null;

const CATEGORY_ICONS = {
  food: "🍔", hotel: "🏨", transport: "🚌", other: "📦"
};

// ── LOAD TRIPS ON PAGE OPEN
async function loadTrips() {
  try {
    const response = await fetch("/api/trips");
    const data = await response.json();
    trips = data.trips;

    const select = document.getElementById("tripSelect");
    select.innerHTML = '<option value="">-- Select a Trip --</option>';
    trips.forEach(function(trip) {
      const option = document.createElement("option");
      option.value = trip.id;
      option.textContent = trip.name;
      select.appendChild(option);
    });

    if (trips.length > 0) {
      currentTripId = trips[0].id;
      select.value = currentTripId;
      renderTrip();
    }
  } catch (error) {
    console.error("Could not load trips:", error);
  }
}

// ── CREATE NEW TRIP
async function createNewTrip() {
  const name = prompt("Trip name? (e.g. Goa Trip)");
  if (!name) return;
  const budget = prompt("Total budget in ₹? (e.g. 15000)");
  if (!budget) return;
  const destination = prompt("Destination? (e.g. Goa, Manali)");
  const dates = prompt("Travel dates? (e.g. Jun 10 – Jun 15)");

  const newTrip = {
    name: name,
    budget: parseFloat(budget),
    destination: destination || "",
    dates: dates || ""
  };

  try {
    const response = await fetch("/api/trips", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTrip)
    });
    const saved = await response.json();
    trips.push(saved);

    const select = document.getElementById("tripSelect");
    const option = document.createElement("option");
    option.value = saved.id;
    option.textContent = saved.name;
    select.appendChild(option);

    currentTripId = saved.id;
    select.value = currentTripId;
    renderTrip();
  } catch (error) {
    console.error("Could not create trip:", error);
  }
}

// ── SWITCH TRIP
function switchTrip() {
  currentTripId = document.getElementById("tripSelect").value;
  if (currentTripId) renderTrip();
}

// ── GET CURRENT TRIP
function getCurrentTrip() {
  return trips.find(function(trip) { return trip.id === currentTripId; });
}

// ── ADD EXPENSE
async function addExpense() {
  const name     = document.getElementById("expenseName").value.trim();
  const amount   = parseFloat(document.getElementById("expenseAmount").value);
  const category = document.getElementById("expenseCategory").value;

  if (!name || isNaN(amount) || amount <= 0) {
    alert("Please enter a valid name and amount.");
    return;
  }
  if (!currentTripId) {
    alert("Please select or create a trip first.");
    return;
  }

  const now = new Date();
  const timeStr = now.toLocaleString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true, day: "2-digit", month: "short" });

  const newExpense = {
    trip_id: currentTripId,
    name: name,
    amount: amount,
    category: category,
    time: timeStr
  };

  try {
    const response = await fetch("/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newExpense)
    });
    const saved = await response.json();
    getCurrentTrip().expenses.push(saved);

    document.getElementById("expenseName").value = "";
    document.getElementById("expenseAmount").value = "";
    renderTrip();
  } catch (error) {
    console.error("Could not add expense:", error);
  }
}

// ── DELETE EXPENSE
async function deleteExpense(expenseId) {
  try {
    await fetch("/api/expenses/" + expenseId, { method: "DELETE" });
    const trip = getCurrentTrip();
    trip.expenses = trip.expenses.filter(function(e) { return e.id !== expenseId; });
    renderTrip();
  } catch (error) {
    console.error("Could not delete expense:", error);
  }
}

// ── RENDER EVERYTHING
function renderTrip() {
  const trip = getCurrentTrip();
  if (!trip) return;

  const totalSpent  = trip.expenses.reduce(function(sum, e) { return sum + e.amount; }, 0);
  const remaining   = trip.budget - totalSpent;
  const percentage  = trip.budget > 0 ? (totalSpent / trip.budget) * 100 : 0;

  // update trip banner
  document.getElementById("tripBannerName").textContent  = trip.name;
  document.getElementById("tripBannerDest").textContent  = trip.destination || "—";
  document.getElementById("tripBannerDates").textContent = trip.dates || "—";
  updateTripBadges(percentage);

  // update stats
  document.getElementById("totalBudget").textContent    = "₹" + trip.budget.toLocaleString("en-IN");
  document.getElementById("totalSpent").textContent     = "₹" + totalSpent.toLocaleString("en-IN");
  document.getElementById("totalRemaining").textContent = "₹" + remaining.toLocaleString("en-IN");
  document.getElementById("expenseCount").textContent   = trip.expenses.length + " expense" + (trip.expenses.length !== 1 ? "s" : "");

  updateProgressBar(percentage);
  updateWarningBanner(percentage);
  renderExpenseList(trip.expenses);
  renderChart(trip.expenses);
  renderBudgetTips(trip.expenses, trip.budget, totalSpent);
}

// ── TRIP BADGES
function updateTripBadges(percentage) {
  const badges = document.getElementById("tripBadges");
  badges.innerHTML = "";

  const pctBadge = document.createElement("div");
  pctBadge.className = "badge " + (percentage >= 100 ? "badge-red" : percentage >= 75 ? "badge-amber" : "badge-green");
  pctBadge.textContent = Math.round(percentage) + "% Used";
  badges.appendChild(pctBadge);

  const statusBadge = document.createElement("div");
  statusBadge.className = "badge " + (percentage >= 100 ? "badge-red" : percentage >= 75 ? "badge-amber" : "badge-green");
  statusBadge.textContent = percentage >= 100 ? "Over Budget" : percentage >= 75 ? "Getting Close" : "On Track";
  badges.appendChild(statusBadge);
}

// ── PROGRESS BAR
function updateProgressBar(percentage) {
  const bar   = document.getElementById("progressBar");
  const label = document.getElementById("progressLabel");
  const pct   = document.getElementById("prog-pct");

  bar.style.width = Math.min(percentage, 100) + "%";
  bar.className = "prog-fill" + (percentage >= 100 ? " red" : percentage >= 75 ? " orange" : "");

  const labelEl = document.querySelector(".prog-pct");
  labelEl.textContent = Math.round(percentage) + "% used";
  labelEl.className = "prog-pct" + (percentage >= 100 ? " red" : percentage >= 75 ? " orange" : "");
}

// ── WARNING BANNER
function updateWarningBanner(percentage) {
  const banner = document.getElementById("warningBanner");
  const text   = document.getElementById("warningText");

  if (percentage >= 100) {
    banner.style.display = "flex";
    banner.className = "warn-banner red";
    text.textContent = "You have exceeded your budget! Time to cut back.";
  } else if (percentage >= 75) {
    banner.style.display = "flex";
    banner.className = "warn-banner";
    text.textContent = "You have used " + Math.round(percentage) + "% of your budget — spend wisely!";
  } else {
    banner.style.display = "none";
  }
}

// ── EXPENSE LIST
function renderExpenseList(expenses) {
  const list  = document.getElementById("expenseList");
  const empty = document.getElementById("emptyExpenses");

  list.innerHTML = "";

  if (expenses.length === 0) {
    empty.style.display = "block";
    return;
  }
  empty.style.display = "none";

  expenses.forEach(function(expense) {
    const li = document.createElement("li");
    li.className = "expense-item";
    li.innerHTML =
      '<div class="exp-left">' +
        '<div class="exp-icon ' + expense.category + '">' + CATEGORY_ICONS[expense.category] + '</div>' +
        '<div>' +
          '<div class="exp-name">' + expense.name + '</div>' +
          '<div class="exp-time">' + (expense.time || "—") + '</div>' +
        '</div>' +
      '</div>' +
      '<div class="exp-right">' +
        '<div class="exp-amt">₹' + expense.amount.toLocaleString("en-IN") + '</div>' +
        '<button class="delete-btn" onclick="deleteExpense(' + expense.id + ')"><i class="ti ti-trash"></i></button>' +
      '</div>';
    list.appendChild(li);
  });
}

// ── CHART
function renderChart(expenses) {
  const canvas = document.getElementById("spendingChart");
  const empty  = document.getElementById("emptyChart");

  if (expenses.length === 0) {
    canvas.style.display = "none";
    empty.style.display  = "block";
    return;
  }

  canvas.style.display = "block";
  empty.style.display  = "none";

  const totals = { food: 0, hotel: 0, transport: 0, other: 0 };
  expenses.forEach(function(e) { totals[e.category] += e.amount; });

  if (spendingChart) spendingChart.destroy();

  spendingChart = new Chart(canvas, {
    type: "doughnut",
    data: {
      labels: ["Food", "Hotel", "Transport", "Other"],
      datasets: [{
        data: [totals.food, totals.hotel, totals.transport, totals.other],
        backgroundColor: ["#1D9E75", "#534AB7", "#EF9F27", "#888780"],
        borderWidth: 2,
        borderColor: "#1e2235"
      }]
    },
    options: {
      cutout: "65%",
      plugins: {
        legend: {
          position: "bottom",
          labels: { color: "#6b7099", font: { size: 12 } }
        }
      }
    }
  });
}

// ── BUDGET TIPS (static, based on spending pattern)
function renderBudgetTips(expenses, budget, totalSpent) {
  const card = document.getElementById("tipsCard");
  const list = document.getElementById("tipsList");

  if (expenses.length === 0) {
    card.style.display = "none";
    return;
  }

  card.style.display = "block";
  list.innerHTML = "";

  const tips = [];
  const totals = { food: 0, hotel: 0, transport: 0, other: 0 };
  expenses.forEach(function(e) { totals[e.category] += e.amount; });

  if (totals.hotel > totalSpent * 0.4) tips.push("Hotel is taking up over 40% of your budget — consider a budget stay for remaining days.");
  if (totals.food > totalSpent * 0.35) tips.push("Food costs are high — try local dhabas and street food to save more.");
  if (totals.transport > totalSpent * 0.2) tips.push("Use local autos or shared cabs instead of private taxis to cut transport costs.");
  if (totalSpent > budget * 0.8)          tips.push("You are close to your limit — avoid non-essential purchases for the rest of the trip.");
  if (tips.length === 0)                  tips.push("Great job! Your spending looks balanced. Keep tracking to stay on budget.");

  tips.forEach(function(tipText, index) {
    const div = document.createElement("div");
    div.className = "tip-item";
    div.innerHTML = '<div class="tip-num">' + (index + 1) + '</div><div class="tip-text">' + tipText + '</div>';
    list.appendChild(div);
  });
}

// ── TAB SWITCHING
function showTab(tabName) {
  document.querySelectorAll(".tab-content").forEach(function(div) { div.style.display = "none"; });
  document.querySelectorAll(".tab-btn").forEach(function(btn) { btn.classList.remove("active"); });
  document.getElementById("tab-content-" + tabName).style.display = "block";
  document.getElementById("tab-" + tabName).classList.add("active");
}

// ── AI SPENDING ANALYSER
async function getAIAdvice() {
  const trip = getCurrentTrip();
  if (!trip || trip.expenses.length === 0) { alert("Add some expenses first!"); return; }

  const totalSpent = trip.expenses.reduce(function(sum, e) { return sum + e.amount; }, 0);
  const summary    = trip.expenses.map(function(e) { return e.name + " (" + e.category + "): ₹" + e.amount; }).join(", ");
  const prompt     = "I am on a trip called '" + trip.name + "' with a budget of ₹" + trip.budget + ". I have spent ₹" + totalSpent + ". My expenses: " + summary + ". Give me 2-3 short practical tips to save money. Be friendly and specific.";

  showLoading("aiLoading", true);
  document.getElementById("aiResponse").style.display = "none";
  const reply = await callGemini(prompt);
  showLoading("aiLoading", false);
  document.getElementById("aiResponse").textContent   = reply;
  document.getElementById("aiResponse").style.display = "block";
}

// ── SMART BUDGET WARNING
async function getSmartWarning() {
  const trip = getCurrentTrip();
  if (!trip || trip.expenses.length === 0) { alert("Add some expenses first!"); return; }

  const totalSpent = trip.expenses.reduce(function(sum, e) { return sum + e.amount; }, 0);
  const pct        = Math.round((totalSpent / trip.budget) * 100);
  const prompt     = "I have a trip budget of ₹" + trip.budget + " and have spent ₹" + totalSpent + " (" + pct + "%). Analyse if this is risky and give a 2-3 line warning or reassurance. Be direct and helpful.";

  showLoading("warningLoading", true);
  document.getElementById("warningResponse").style.display = "none";
  const reply = await callGemini(prompt);
  showLoading("warningLoading", false);
  document.getElementById("warningResponse").textContent   = reply;
  document.getElementById("warningResponse").style.display = "block";
}

// ── PACKING LIST GENERATOR
async function generatePackingList() {
  const destination = document.getElementById("destinationInput").value.trim();
  if (!destination) { alert("Please enter a destination!"); return; }

  const prompt = "I am travelling to " + destination + " from India. Give me a packing list of 12-15 essential items. Return ONLY the items, one per line, no numbering, no extra text.";

  showLoading("packingLoading", true);
  document.getElementById("packingList").style.display = "none";
  const reply = await callGemini(prompt);
  showLoading("packingLoading", false);

  const items = reply.split("\n").filter(function(line) { return line.trim() !== ""; });
  renderPackingList(items);
}

// ── RENDER PACKING CHECKLIST
function renderPackingList(items) {
  const ul = document.getElementById("packingItems");
  ul.innerHTML = "";
  items.forEach(function(itemText) {
    const li       = document.createElement("li");
    const checkbox = document.createElement("input");
    checkbox.type  = "checkbox";
    checkbox.addEventListener("change", function() {
      li.classList.toggle("checked", checkbox.checked);
    });
    li.appendChild(checkbox);
    li.appendChild(document.createTextNode(itemText.trim()));
    ul.appendChild(li);
  });
  document.getElementById("packingList").style.display = "block";
}

// ── CALL GEMINI API

async function callGemini(promptText) {
  try {
    const response = await fetch("/api/gemini", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        prompt: promptText
      })
    });

    const data = await response.json();

    console.log("Gemini Response:", data);

    if (!data.candidates) {
      console.error(data);
      return "AI service unavailable.";
    }

    return data.candidates[0].content.parts[0].text;

  } catch (error) {
    console.error("Gemini API error:", error);
    return "Sorry, could not get a response.";
  }
}
// ── SHOW / HIDE LOADING DOTS
function showLoading(elementId, isVisible) {
  document.getElementById(elementId).style.display = isVisible ? "flex" : "none";
}

// ── START
loadTrips();