// Bay World — two built-in sample quests.
//
// Team BAY3 is writing the real WebXR/bayworld/js/quests.js (quest data and
// rules) against quest-engine.js's registerQuests() interface. These two
// originals — one main story beat, one side job — ship so the app, its map
// and its HUD all have something real to run before that lands; see
// WebXR/bayworld/js/quests-select.js for the one-line switch.
export const BW_SAMPLE_QUESTS = [
  {
    id: "first-shift",
    title: "First Shift",
    giver: "Dispatch Chief",
    site: "civic-charge-plaza",
    kind: "main",
    steps: [
      { type: "goto", target: "civic-charge-plaza", text: "Head to Civic Charge Plaza and clock in." },
      { type: "station", target: "charge-point", text: "Run the Charge Point training station." },
      { type: "talk", target: "clocktower-plaza", text: "Report back to the dispatch chief at Clocktower Plaza." },
    ],
    reward: { reputation: 25, credits: 100 },
  },
  {
    id: "harbor-run",
    title: "Harbor Run",
    giver: "Dock Foreman",
    site: "harbor-crane-berth",
    kind: "side",
    steps: [
      { type: "drive", target: "harbor-crane-berth", text: "Drive out to the Harbor Crane Berth." },
      { type: "station", target: "dock-crane", text: "Run the Dock Crane training station." },
      { type: "find", target: "ferry-terminal", text: "Find the Ferry Terminal and take in the view." },
    ],
    reward: { reputation: 20, credits: 80 },
  },
];
