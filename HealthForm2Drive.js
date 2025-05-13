let inputs = input.config();
let id = inputs.record_id;
let first = inputs.first;
let last = inputs.last;
let hdate = inputs.hdate;

// console.log(hdate);
// let now = new Date();
// let formatted = now.toISOString().split("T")[0];

let table = base.getTable("Health Forms (2024-2025)");
let record = await table.selectRecordAsync(id);
if (!record) {
    throw new Error("No record found.");
}

let attachments = record.getCellValue("Health Form File");
if (!attachments || attachments.length === 0) {
    throw new Error("No health form file(s) attached.");
}



let files = attachments.map(file => ({
    name: first +" " + last + " "+ hdate,
    url: file.url
}));


try {
    let response = await fetch("https://script.google.com/a/macros/aozoracommunity.org/s/AKfycbw6Ejk77L9VedDB5SxOIv5yXtiOVBaIPPEuwRvjncuPMR22vwuWz_eXoS_HfvhGSDtK/exec", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ files })
    });

    let result = await response.text();
    console.log("Google Script response:", result);
} catch (err) {
    console.log("Fetch error (likely due to redirect):", err.message);
}


