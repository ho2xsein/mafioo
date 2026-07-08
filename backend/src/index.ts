import { createApp } from "./app.js";
import { env } from "./lib/env.js";

const app = createApp();

app.listen(env.port, () => {
  console.log(`mafioo backend listening on :${env.port}`);
});
