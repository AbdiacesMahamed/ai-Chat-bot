import express from "express";
import path from "path";
import streamRouter from "./routes/stream";
import playwrightRouter from "./routes/playwright";

const app = express();
app.use(express.json());

// Serve the built frontend from the project public folder
app.use(express.static(path.resolve(process.cwd(), "public")));

// API routes
app.use("/api/stream", streamRouter);
app.use("/api/playwright", playwrightRouter);

export default app;
