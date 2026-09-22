# The guide's emotional intelligence

`WebXR/shared/ei-guide.js` decides the tone of what the SmartCiti.X guide says around a score. The engine in `game.js` still scores; this layer follows the rules a peer-support trainer follows: name what happened in one plain sentence, say what wins next time, never blame, never minimise, and after a hard run ask how the person is and point at the real support line.

| Moment | What the guide does |
|---|---|
| First unsafe action | Writes one supportive line to the feedback rail; the station's own call-out is what is spoken. |
| Second or later unsafe action on a run | Speaks a line that points at the setup rather than the hands. |
| Missed interruption | Rail and voice: what came while the hands were busy, and that the alarm wins next time. |
| Interruption answered with the wrong control | Rail and voice: right instinct, wrong control, and why the separation is the lesson. |
| Answered interruption | Nothing said; the scene already showed it. |
| Finish | One closing line, clean or rough, then the check-in. |

## The check-in

The results card ends with a question that is never scored: **How are you doing after that run?** Three answers (Steady, A bit shaken, Need a minute), each with one supportive reply. A rough run (an unsafe action or a missed interruption) adds the pointer to the local's peer-support team or EAP line; a station or programme can name its own line through `supportLine`.

Answers are stored only in the learner's own browser under `smartcitix-checkins-v1`, are never transmitted, and are not part of the training record or any export. The first-responder series (`tools/briefs/first-responder-brief.md`) relies on this card, and every station in the platform gets it.
