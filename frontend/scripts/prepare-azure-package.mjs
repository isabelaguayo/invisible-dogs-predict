import { cp, mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const projectRoot = fileURLToPath(new URL("..", import.meta.url));
const buildRoot = path.join(projectRoot, ".next");
const standaloneRoot = path.join(buildRoot, "standalone");
const deployRoot = path.join(projectRoot, "deploy");

async function assertExists(relativePath) {
  const target = path.join(deployRoot, relativePath);
  await stat(target).catch(() => {
    throw new Error(`Missing required deployment artifact: ${relativePath}`);
  });
}

await rm(deployRoot, { recursive: true, force: true });
await mkdir(path.join(deployRoot, ".next"), { recursive: true });

await cp(standaloneRoot, deployRoot, { recursive: true });
await cp(path.join(buildRoot, "static"), path.join(deployRoot, ".next", "static"), { recursive: true });
await cp(path.join(projectRoot, "public"), path.join(deployRoot, "public"), { recursive: true });
await cp(path.join(projectRoot, "package-lock.json"), path.join(deployRoot, "package-lock.json"));

const deploymentPackagePath = path.join(deployRoot, "package.json");
const deploymentPackage = JSON.parse(await readFile(deploymentPackagePath, "utf8"));
deploymentPackage.scripts = { start: "node server.js" };
delete deploymentPackage.devDependencies;
await writeFile(deploymentPackagePath, `${JSON.stringify(deploymentPackage, null, 2)}\n`);

for (const requiredPath of [
  "server.js",
  "package.json",
  "package-lock.json",
  path.join(".next", "BUILD_ID"),
  path.join(".next", "static"),
  "public",
  path.join("public", "images", "petfinder", "catalog"),
  path.join("server-data", "adoptante", "petfinderProfiles.v1.json"),
  path.join("server-data", "adoptante", "petfinderDinov2Embeddings.v1.f32"),
]) {
  await assertExists(requiredPath);
}

console.log(`Azure deployment package prepared at ${deployRoot}`);
