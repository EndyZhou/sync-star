import { migrateStars } from "./migrateStars";

async function main() {
  try {
    await migrateStars();
  } catch (error) {
    console.error("An unexpected error occurred:", error);
    process.exit(1);
  }
}

main();
