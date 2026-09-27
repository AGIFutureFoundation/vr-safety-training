// The quest board, one import away from the real thing.
//
// Team BAY3 is landing WebXR/bayworld/js/quests.js: the real quest data and
// rules, written against quest-engine.js's registerQuests() interface. This
// file is the one-line switch — exactly the pattern WebXR/bayworld/js/city.js
// uses for the world and WebXR/fairway/js/course.js uses for the course —
// so app.js never names quests-sample.js or quests.js directly.
//
// Once WebXR/bayworld/js/quests.js exists, change the import below from
// "./quests-sample.js" to "./quests.js" (its own export should be named
// BW_QUESTS, or re-export BW_SAMPLE_QUESTS's shape under that name), and add
// it — not quests-sample.js — to tools/bundle_webxr.py's "bayworld" module
// list in its place.
import { BW_SAMPLE_QUESTS } from "./quests-sample.js";

export const BW_QUESTS = BW_SAMPLE_QUESTS;
