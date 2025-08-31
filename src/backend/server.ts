import dotenv from 'dotenv';
import app from './app';
import { headlessFlag } from './browser/manager';

dotenv.config();

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

// Ensure Playwright opens headed by default at runtime
headlessFlag(false);

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on http://localhost:${PORT}`);
});
