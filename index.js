const express = require("express");
const path = require("path");
const bodyParser = require('body-parser');
const parseRoutes = require("./routes/parseRoutes");

const app = express();
const PORT = 3001;

// app.use(express.json());

// Increase the limit for JSON payloads
app.use(bodyParser.json({ limit: '50mb' })); // Adjust the limit as needed
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

app.use("/", parseRoutes);

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.send("<h1>Server is running</h1>");
});

app.listen(PORT, () => {
  console.log(`Server is running on: http://localhost:${PORT}`);
});
