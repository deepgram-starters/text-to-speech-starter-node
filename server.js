const { createClient } = require("@deepgram/sdk");
const express = require("express");
const http = require("http");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const app = express();
const server = http.createServer(app);
app.use(express.json());

const deepgram = createClient(process.env.DEEPGRAM_API_KEY);

app.use(express.static("public/"));

app.post("/api", async (req, res) => {
  const { body } = req;
  const { text, model } = body;

  try {
    const response = await deepgram.speak.request({ text }, { model });
    const stream = await response.getStream();
    for await (const chunk of stream) {
      res.write(chunk);
    }
    res.end();
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

// Serve the index.html file on root path
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/public/index.html"));
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
