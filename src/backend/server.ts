import dotenv from "dotenv";
dotenv.config();

(async () => {
  const mod = await import("./app.js");
  const app = (mod && (mod as any).default) || mod;
  const port = process.env.PORT || 3000;
  app.listen(port, () =>
    console.log(`Server listening on http://localhost:${port}`)
  );
})();
