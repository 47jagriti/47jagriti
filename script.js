// ===== DARK MODE =====
function toggleDarkMode() {
    document.body.classList.toggle("dark");
    localStorage.setItem("theme", document.body.classList.contains("dark") ? "dark" : "light");
}

// ===== SIDE MENU =====
function openMenu() {
    document.getElementById('sideMenu').classList.add('open');
    document.getElementById('overlay').classList.add('show');
}

function closeMenu() {
    document.getElementById('sideMenu').classList.remove('open');
    document.getElementById('overlay').classList.remove('show');
}

function toggleTheme() {
    document.body.classList.toggle('dark');
    localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
}

// ===== PRODUCTIVITY / STUDY DATA =====
function saveData() {
    const hours = document.getElementById("hours") ? document.getElementById("hours").value : null;
    const sleep = document.getElementById("sleep") ? document.getElementById("sleep").value : null;
    const mood  = document.getElementById("mood")  ? document.getElementById("mood").value  : null;

    if (!hours || !sleep || !mood) {
        alert("Please fill all fields!");
        return;
    }

    const data = { hours, sleep, mood };
    localStorage.setItem("studyData", JSON.stringify(data));

    // Save to history
    const history = JSON.parse(localStorage.getItem("history")) || [];
    history.push(data);
    localStorage.setItem("history", JSON.stringify(history));

    alert("Saved ✅");
}

function predict() {
    const data = JSON.parse(localStorage.getItem("studyData"));

    if (!data) {
        alert("No data found! Please save your data first.");
        return null;
    }

    let score = 0;
    if (data.hours >= 5)       score++;
    if (data.sleep >= 7)       score++;
    if (data.mood === "High")  score++;

    if (score >= 2) return "High Productivity";
    else if (score === 1) return "Medium Productivity";
    else return "Low Productivity";
}

function checkProductivity() {
    const level = predict();
    if (!level) return;
    const resultEl = document.getElementById("result");
    if (resultEl) resultEl.innerText = level;
}

function generatePlan() {
    const level = predict();
    if (!level) return;

    let plan = "";
    if (level === "High Productivity") {
        plan = "📚 Study 6-8 hours, practice DSA, revise notes.";
    } else if (level === "Medium Productivity") {
        plan = "📖 Study 3-4 hours, focus on easy topics first.";
    } else {
        plan = "😴 Rest + light revision only. Watch a tutorial, take breaks.";
    }

    const planEl = document.getElementById("plan");
    if (planEl) planEl.innerText = plan;
}

function showHistory() {
    const history = JSON.parse(localStorage.getItem("history")) || [];
    const histEl = document.getElementById("history");
    if (!histEl) return;

    if (history.length === 0) {
        histEl.innerHTML = "<p>No history found.</p>";
        return;
    }

    let output = "";
    history.forEach((item, index) => {
        output += `<p>Day ${index + 1}: ${item.hours}h study, ${item.sleep}h sleep, Mood: ${item.mood}</p>`;
    });
    histEl.innerHTML = output;
}

// ===== CHATBOT (Gemini API) =====
const API_KEY = "AIzaSyBtBfmdaPatUvulM6wfElBuhVkxoutQ";

async function sendMessage() {
    const inputEl   = document.getElementById("userInput");
    const chatbox   = document.getElementById("chatbox");
    if (!inputEl || !chatbox) return;

    const input = inputEl.value.trim();
    if (!input) return;

    chatbox.innerHTML += `<p class="user"><b>You:</b> ${input}</p>`;
    inputEl.value = "";

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: input }] }]
                })
            }
        );

        const data = await response.json();
        const botReply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't understand that.";
        chatbox.innerHTML += `<p class="bot"><b>Bot:</b> ${botReply}</p>`;
        chatbox.scrollTop = chatbox.scrollHeight;

    } catch (error) {
        chatbox.innerHTML += `<p class="bot">❌ Error: Could not connect to AI. Please check your internet connection.</p>`;
        console.error(error);
    }
}

// ===== SECTION SWITCHER =====
function showSection(sectionId) {
    document.querySelectorAll(".section").forEach(sec => sec.style.display = "none");
    const selected = document.getElementById(sectionId);
    if (selected) selected.style.display = "block";
}

// ===== ON PAGE LOAD =====
window.onload = function () {
    // Restore dark mode
    if (localStorage.getItem("theme") === "dark") {
        document.body.classList.add("dark");
    }

    // Enter key for chatbot
    const input = document.getElementById("userInput");
    if (input) {
        input.addEventListener("keypress", function (e) {
            if (e.key === "Enter") sendMessage();
        });
    }
};