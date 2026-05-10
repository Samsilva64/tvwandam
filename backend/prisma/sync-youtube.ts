import "dotenv/config";
import { prisma } from "../src/prisma";
import { syncYoutubeChannel } from "../src/services/youtubeSync";

const refreshNonManual = process.argv.includes("--refresh");

async function main() {
  const result = await syncYoutubeChannel({ refreshNonManual });
  console.log(
    `YouTube sync OK: ${result.videos} videos, ${result.playlists} playlists. refreshNonManual=${result.refreshNonManual}`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
