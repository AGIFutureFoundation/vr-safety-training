// The course, one import away from the real thing.
//
// Team OW1 is landing WebXR/shared/fairway.js with this exact interface:
// FAIRWAY_HOLES, FAIRWAY_FACILITY, buildFairwayPark(parent, opts),
// fairwayHeight(x, z) and fairwayLieAt(x, z). Fairway Park is written against
// that interface from day one but ships today against course-stub.js's small
// original nine-hole layout, so the app and its checks run before the real
// course lands.
//
// The switch is exactly the one import line below: once
// WebXR/shared/fairway.js exists, change "./course-stub.js" to
// "../../shared/fairway.js" here, and swap the matching line in
// tools/bundle_webxr.py's "fairway" module list from
// WEBXR / "fairway/js/course-stub.js" to SHARED / "fairway.js". Nothing else
// in this app names the course module directly — every other file imports
// from here.
import { FAIRWAY_HOLES, FAIRWAY_FACILITY, buildFairwayPark, fairwayHeight, fairwayLieAt } from "./course-stub.js";

export { FAIRWAY_HOLES, FAIRWAY_FACILITY, buildFairwayPark, fairwayHeight, fairwayLieAt };
