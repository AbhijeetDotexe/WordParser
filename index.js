const express = require("express");
const path = require("path");
const parseRoutes = require("./routes/parseRoutes");

const app = express();
const PORT = 3001;

app.use(express.text());

app.use("/", parseRoutes);

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.send("<h1>Server is running</h1>");
});

app.listen(PORT, () => {
  console.log(`Server is running on: http://localhost:${PORT}`);
});
