require("dotenv").config();
const express = require("express");
const cors = require("cors");

// Global crash logging to know why server exits
process.on("uncaughtException", (err) => {
  console.error("[uncaughtException]", err);
});
process.on("unhandledRejection", (reason) => {
  console.error("[unhandledRejection]", reason);
});
process.on("SIGINT", () => {
  console.error("[SIGINT] Server is shutting down");
  process.exit(0);
});
process.on("SIGTERM", () => {
  console.error("[SIGTERM] Server is shutting down");
  process.exit(0);
});

const app = express();
app.set("etag", false);
app.use(cors());
app.use(express.json());

// Routes
const authRouter = require("./routes/auth");
const doctorsRouter = require("./routes/doctors");
const appointmentsRouter = require("./routes/appointments");
const calendarRouter = require("./routes/calendar");
const countersRouter = require("./routes/counters");
const resultsRouter = require("./routes/results");

app.use("/api/auth", authRouter);
app.use("/api/doctors", doctorsRouter);
app.use("/api/appointments", appointmentsRouter);
app.use("/api/calendar", calendarRouter);
app.use("/api/counters", countersRouter);
app.use("/api/results", resultsRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server đang chạy tại http://localhost:${PORT}`),
);
