import express from "express";
import fs from "fs";
import path from "path";

const app = express();
const PORT = process.env.PORT || 3000;
const HOSTED_DIR = path.join(process.cwd(), "hosted");

// Middleware to parse JSON body
app.use(express.json({ limit: "10mb" }));

// Make sure hosted directory exists
if (!fs.existsSync(HOSTED_DIR)) {
  fs.mkdirSync(HOSTED_DIR);
}

// API route to save HTML file
app.post("/api/save", (req, res) => {
  const { filename, html } = req.body;

  if (!filename || !html) {
    return res.status(400).json({ error: "Filename and HTML required." });
  }

  // Sanitize filename
  const safeName = filename.replace(/[^a-z0-9\.\-_]/gi, "_");
  const filePath = path.join(HOSTED_DIR, safeName);

  fs.writeFile(filePath, html, (err) => {
    if (err) {
      return res.status(500).json({ error: "Failed to save file." });
    }

    const url = `${req.protocol}://${req.get("host")}/hosted/${safeName}`;
    return res.json({ link: url });
  });
});

// Serve static files from hosted folder
app.use("/hosted", express.static(HOSTED_DIR));

// Root route (optional)
app.get("/", (req, res) => {
  res.send("HTML Host API Running");
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
