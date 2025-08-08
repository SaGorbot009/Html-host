import fs from "fs";
import path from "path";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { filename, html } = req.body;
  if (!filename || !html) {
    return res.status(400).json({ error: "Filename and HTML required" });
  }

  // sanitize filename
  const safeName = filename.replace(/[^a-z0-9\.\-_]/gi, "_");

  // Vercel readonly file system, so saving to /tmp (ephemeral storage)
  const filePath = path.join("/tmp", safeName);

  try {
    await fs.promises.writeFile(filePath, html, "utf8");
    // We cannot serve from /tmp, so instead return the file content or URL to fetch?
    // Vercel doesn’t support persistent storage, so direct hosting HTML files won’t work here.
    // Alternative: return the HTML content as response or store on external storage (e.g. S3)

    // For demo, just return success with file path
    res.status(200).json({ message: "File saved temporarily", filename: safeName });
  } catch (error) {
    res.status(500).json({ error: "Failed to save file" });
  }
}
