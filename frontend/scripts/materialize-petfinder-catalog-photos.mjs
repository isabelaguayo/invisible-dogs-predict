import { copyFile, mkdir, readFile, rm } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const frontendRoot = fileURLToPath(new URL("..", import.meta.url));
const repositoryRoot = path.resolve(frontendRoot, "..");
const profilesPath = path.join(
  frontendRoot,
  "server-data",
  "adoptante",
  "petfinderProfiles.v1.json",
);
const sourceRoot = path.join(repositoryRoot, "data", "raw_petfinder", "train_images");
const targetRoot = path.join(frontendRoot, "public", "images", "petfinder", "catalog");

const profiles = JSON.parse(await readFile(profilesPath, "utf8"));
const expectedFiles = new Map();

for (const profile of profiles) {
  const expectedFile = `${profile.petId}-1.jpg`;
  if (profile.primaryImageFile !== expectedFile) {
    throw new Error(
      `Unexpected primary image for ${profile.petId}: ${profile.primaryImageFile}; expected ${expectedFile}`,
    );
  }
  expectedFiles.set(profile.petId, expectedFile);
}

await rm(targetRoot, { recursive: true, force: true });
await mkdir(targetRoot, { recursive: true });

const entries = [...expectedFiles.entries()];
const batchSize = 64;

for (let offset = 0; offset < entries.length; offset += batchSize) {
  const batch = entries.slice(offset, offset + batchSize);
  await Promise.all(batch.map(async ([petId, file]) => {
    const source = path.join(sourceRoot, file);
    const bytes = await readFile(source);
    if (bytes.subarray(0, 42).toString("utf8").startsWith("version https://git-lfs.github.com/spec/v1")) {
      throw new Error(`Git LFS object was not materialized for ${petId}: ${file}`);
    }
    if (bytes[0] !== 0xff || bytes[1] !== 0xd8) {
      throw new Error(`Source is not a JPEG for ${petId}: ${file}`);
    }
    await copyFile(source, path.join(targetRoot, file));
  }));
}

console.log(`Materialized ${entries.length} PetFinder primary photos for the web catalog.`);
