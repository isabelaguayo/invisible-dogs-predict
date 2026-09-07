// The Node-only import deliberately prevents this module from entering a
// browser bundle without adding the optional `server-only` npm package.
import "node:fs";

import profiles from "../../../server-data/adoptante/petfinderProfiles.v1.json" with { type: "json" };
import petfinderDinov2Manifest from "../../../server-data/adoptante/petfinderDinov2Manifest.v1.json" with { type: "json" };
import tsinghuaPrototypeManifest from "../../../server-data/adoptante/tsinghuaPrototypeManifest.v1.json" with { type: "json" };
import config from "../../data/adoptante/generated/adopterMvpConfig.v1.json" with { type: "json" };
import type { AdopterProfile } from "../../types/adopterSearch.ts";

export const adopterMvpConfig = Object.freeze(config);
export const adopterProfiles = profiles as AdopterProfile[];
export const adopterPetfinderEmbeddingManifest = Object.freeze(petfinderDinov2Manifest);
export const adopterTsinghuaPrototypeManifest = Object.freeze(tsinghuaPrototypeManifest);
