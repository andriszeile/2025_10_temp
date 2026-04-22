document.addEventListener("DOMContentLoaded", () => {
    const dateE1 = document.getElementById("d");
    const minE1 = document.getElementById("tmin");
    const maxE1 = document.getElementById("tmax");

    const form = document.querySelector("form");
    const tbody = document.querySelector("tbody");
    const avg_summary = document.getElementById("avg_all");
    const add_btn = document.querySelector(".btn");

    const STORAGE_KEY = "temperature_records1"

    if (!dateE1 || !minE1 || !maxE1 || !form || !tbody || !avg_summary || !add_btn) {
        console.warn("Trūkst obligātais elements.");
        return;
    }

    let records = loadRecords();
    renderTable(tbody, records);
    renderOverallAverage(avg_summary, records);

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const date = (dateE1.value || "").trim();
        const min = parseFloat(minE1.value);
        const max = parseFloat(maxE1.value);

        const err = validateInput(date, min, max);
        if (err) {
            alert(err);
            return;
        }

        const newRecord = { date, min, max };
        records.push(newRecord);
        saveRecords(records);
        renderTable(tbody, records);
        renderOverallAverage(avg_summary, records);
        form.reset();
    });

    // Palīgfunkcijas
    function validateInput(date, min, max) {
        if (!date) return "Lūdzu ievadi datumu.";
        if (Number.isNaN(min)) return "Lūdzu ievadi minimālo temperatūru.";
        if (Number.isNaN(max)) return "Lūdzu ievadi maksimālo temperatūru.";
        if (min > max) return "Minimālā temperatūra nevar būt lielāka par maksimālo.";
        return null;
    }

    function calcDayAvg(min, max) {
        return (min + max) / 2;
    }

    function renderTable(tbodyE1, items) {
        // notīra tabulas rindas ar datiem
        tbodyE1.innerHTML = "";

        // jaunas tabulas datu rindu veidošana
        for (const it of items) {
            const avg = calcDayAvg(it.min, it.max);
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td class="date">${escapeHtml(it.date)}</td>
                <td class="num">${Number(it.min).toFixed(1)}</td>
                <td class="num">${Number(it.max).toFixed(1)}</td>
                <td class="num"><span class="avg-badge"><span class="dot"></span>${avg.toFixed(2)}</span></td>
            `;
            tbodyE1.appendChild(tr);
        }
    }

    function renderOverallAverage(avg_summary, items) {
        const avgs = items.map((it) => calcDayAvg(it.min, it.max));
        const overall = avgs.length ? avgs.reduce((a, b) => a + b, 0) / avgs.length : 0;
        avg_summary.textContent = overall.toFixed(2);
    }

    function saveRecords(items) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }

    function loadRecords() {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];

        try {
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed : [];
        } catch (error) {
            console.error("Neizdevās nolasīt saglabātos datus:", error);
            return [];
        }
    }

    function readRecordsFromTable(tbodyE1) {
        const rows = Array.from(tbodyE1.querySelectorAll("tr"));

        const out = [];
        for (const row of rows) {
            const tds = row.querySelectorAll("td");
            if (tds.length < 3) continue;

            const date = (tds[0].textContent || "").trim();
            const min = parseFloat((tds[1].textContent || "").replace(",", "."));
            const max = parseFloat((tds[2].textContent || "").replace(",", "."));

            if (!date || Number.isNaN(min) || Number.isNaN(max)) continue;
            out.push({ date, min, max });
        }
        return out;
    }

    function escapeHtml(text) {
        return String(text)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/\"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }
});
