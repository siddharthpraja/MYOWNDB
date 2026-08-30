const express = require("express");
const session = require("express-session");
const path = require("path");
const cors = require("cors");
const fs = require("fs");

const authRoutes = require("./routes/authRoutes");
const workbookRoutes = require("./routes/workbookRoutes");
const tableRoutes = require("./routes/tableRoutes");
const columnRoutes = require("./routes/columnRoutes");
const rowRoutes = require("./routes/rowRoutes");
const queryRoutes = require("./routes/queryRoutes");
const exportRoutes = require("./routes/exportRoutes");
const uploadRoutes = require("./routes/uploadRoutes");

const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:8081"],
    credentials: true,
  })
);

app.use(express.json());


const PORT = 3000;

const DATA_DIR = path.join(__dirname, "data");
const DATABASE_DIR = path.join(DATA_DIR, "databases");

fs.mkdirSync(DATA_DIR, { recursive: true });
fs.mkdirSync(DATABASE_DIR, { recursive: true });

const usersFile = path.join(DATA_DIR, "users.json");

if (!fs.existsSync(usersFile)) {
  fs.writeFileSync(usersFile, "[]");
}

app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret:
      process.env.SESSION_SECRET || "change-this-secret-before-production",

    resave: false,

    saveUninitialized: false,

    cookie: {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    },
  }),
);

app.use(express.static(path.join(__dirname, "public")));

app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);

app.use("/api/auth", authRoutes);
app.use("/api/workbook", workbookRoutes);
app.use("/api/tables", tableRoutes);
app.use("/api/columns", columnRoutes);
app.use("/api/rows", rowRoutes);
app.use("/api/query", queryRoutes);
app.use("/api/export", exportRoutes);
app.use("/api/upload", uploadRoutes);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});



app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
  });
});

app.listen(PORT, () => {
  console.log(`MyExcelDB running Sucess`);
});
