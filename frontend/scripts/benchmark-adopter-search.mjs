import { performance } from "node:perf_hooks";

import {
  getAdopterSearchDiagnostics,
  preloadAdopterSearchArtifacts,
  searchAdopterByBreed,
} from "../src/lib/adoptante/search.ts";

function measure(state, repetitions = 25) {
  const timings = [];
  for (let index = 0; index < repetitions; index += 1) {
    const started = performance.now();
    searchAdopterByBreed(state, { limit: 20 });
    timings.push(performance.now() - started);
  }
  timings.sort((left, right) => left - right);
  return {
    repetitions,
    medianMs: timings[Math.floor(timings.length * 0.5)],
    p95Ms: timings[Math.floor(timings.length * 0.95)],
    maximumMs: timings.at(-1),
  };
}

const allCandidates = {
  referenceType: "breed",
  prototypeLabel: 125,
};
const filteredCandidates = {
  sex: "Hembra",
  size: "Mediano",
  coat: "Largo",
  health: "Saludable",
  vaccinated: "Sí",
  referenceType: "breed",
  prototypeLabel: 1,
};

const memoryBeforeLoad = process.memoryUsage();
const coldStarted = performance.now();
preloadAdopterSearchArtifacts();
const initialLoadMs = performance.now() - coldStarted;
const memoryAfterLoad = process.memoryUsage();
const firstSearchStarted = performance.now();
const coldResult = searchAdopterByBreed(allCandidates, { limit: 20 });
const firstSearchAfterLoadMs = performance.now() - firstSearchStarted;

const report = {
  node: process.version,
  initialLoadMs,
  firstSearchAfterLoadMs,
  allCandidates: {
    candidateCount: coldResult.candidateCount,
    ...measure(allCandidates),
  },
  filteredCandidates: {
    candidateCount: searchAdopterByBreed(filteredCandidates, { limit: 20 }).candidateCount,
    ...measure(filteredCandidates),
  },
  memory: {
    binaryPayloadBytes: getAdopterSearchDiagnostics().binaryPayloadBytes,
    rssDeltaBytes: memoryAfterLoad.rss - memoryBeforeLoad.rss,
    arrayBuffersDeltaBytes: (
      memoryAfterLoad.arrayBuffers - memoryBeforeLoad.arrayBuffers
    ),
    rssAfterLoadBytes: memoryAfterLoad.rss,
    heapUsedAfterLoadBytes: memoryAfterLoad.heapUsed,
  },
  cache: getAdopterSearchDiagnostics(),
};

console.log(JSON.stringify(report, null, 2));
