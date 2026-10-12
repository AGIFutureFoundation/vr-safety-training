// ROBO-ARENA: a SMALL language-conditioned robot model trained here (docs/consoles/ROBO-ARENA.md). Not a large language
// model: a softmax over hashed task-text features crossed with the scene features, trained on the device, no network.
// (Contract stub: raLmTrain returns null until the model lands, so raRun reports it as not applicable.)
export const RA_LM_LABEL = "small language-conditioned model trained here (not a large language model)";
export function raLmTrain() { return null; }
export function raLmPolicy() { return () => ({ type: "wait" }); }
