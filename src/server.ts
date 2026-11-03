import dns from "node:dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);

import app from "./app";
import config from "./app/config";
import { connectDB } from "./app/lib/db";
import seedAdmin from "./app/utils/seedAdmin";

const main = async () => {
  try {
    await connectDB();
    await seedAdmin();
    app.listen(config.port, () => {
      console.log(`Server running on port ${config.port}`);
    });
  } catch (error) {
    console.error("Failed to start server", error);
    process.exit(1);
  }
};

main();