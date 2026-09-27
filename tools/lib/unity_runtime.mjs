/**
 * The UPM runtime package tools/export_unity.mjs writes beside the content:
 * the manifest, the assembly definition, the four C# files and the README.
 * Templates live here so the exporter regenerates them on every run and the
 * checker can diff them like everything else. The scoring constants are the
 * ones WebXR/shared/game.js exports; keep them in step by hand and the
 * checker (tools/check_unity_export.mjs) will hold you to it.
 */
export const SCORING = {
  STEP_POINTS: 100, WRONG_STEP_PENALTY: 25, HAZARD_PENALTY: 50, MAX_COMBO: 2.0,
  INTERRUPT_POINTS: 120, INTERRUPT_SPEED_BONUS: 60, PREPARED_BONUS: 0.1,
};

export function RUNTIME_FILES({ version, stations, programmes }) {
  return {
    "package.json": JSON.stringify({
      name: "org.agifuturefoundation.smartcitix",
      version,
      displayName: "SmartCiti.X Content Bridge",
      description: "Runs the SmartCiti.X ~Holodeck procedures in Unity: the station catalog, the step-kind state machine with the WebXR engine's pass rules, and training records that round-trip with the web apps.",
      unity: "2021.3",
      license: "CC0-1.0",
      author: { name: "AGI Future Foundation", url: "https://github.com/AGIFutureFoundation/vr-safety-training" },
      keywords: ["safety-training", "vr", "procedures", "smartcitix"],
      samples: [{ displayName: "Content", description: `${stations} stations, ${programmes} programmes and the world data under Content/`, path: "Content" }],
    }, null, 2) + "\n",

    "Runtime/SmartCitiX.asmdef": JSON.stringify({
      name: "SmartCitiX",
      rootNamespace: "SmartCitiX",
      references: [],
      includePlatforms: [],
      excludePlatforms: [],
      allowUnsafeCode: false,
      overrideReferences: false,
      precompiledReferences: [],
      autoReferenced: true,
      defineConstraints: [],
      versionDefines: [],
      noEngineReferences: false,
    }, null, 2) + "\n",

    "Runtime/StationCatalog.cs": STATION_CATALOG_CS,
    "Runtime/StationRunner.cs": STATION_RUNNER_CS,
    "Runtime/TrainingRecord.cs": TRAINING_RECORD_CS,
    "README.md": README_MD({ version, stations, programmes }),
  };
}

const STATION_CATALOG_CS = `// SmartCiti.X content bridge — the station catalog.
//
// Loads the JSON tools/export_unity.mjs writes under Content/ (stations,
// programmes, worlds) into plain C# objects. Unity's JsonUtility cannot read
// a dictionary, and a station's hazards, item names and notes are maps keyed
// by hit id, so this carries its own small JSON reader and needs no package
// beyond UnityEngine.
using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Text;
using UnityEngine;

namespace SmartCitiX
{
    /// One step of a procedure. The kind is one of select, sequence, find,
    /// gauge, hold, track, turn, drag, drive — see StationRunner for the rules.
    [Serializable]
    public class Step
    {
        public string id;
        public string kind;
        public string target;
        public List<string> targets = new List<string>();
        public string title;
        public string prompt;
        public string why;
        public bool anyOrder;
        public Dictionary<string, string> itemNames = new Dictionary<string, string>();
        public Dictionary<string, string> itemNotes = new Dictionary<string, string>();
        public Dictionary<string, string> decoyNotes = new Dictionary<string, string>();
        public string outOfOrderNote;
        public float seconds;
        public string holdBreakNote;
        public Dictionary<string, object> gauge;
        public Dictionary<string, object> track;
        public Dictionary<string, object> turn;
        public Dictionary<string, object> drag;
        public Dictionary<string, object> drive;
    }

    [Serializable]
    public class Interrupt
    {
        public string id;
        public string after;
        public float delay = 3f;
        public float seconds = 12f;
        public string alert;
        public string cue;
        public string target;
        public string why;
        public string missNote;
        public string wrongNote;
    }

    [Serializable]
    public class Citation { public string id; public string body; public string title; public string citedAs; }

    [Serializable]
    public class Station
    {
        public string app;
        public string id;
        public string title;
        public string name;
        public string tagline;
        public string category;
        public string domain;
        public string trade;
        public string certification;
        public string district;
        public bool flat;
        public float parSeconds = 150f;
        public List<string> programmes = new List<string>();
        public List<Step> steps = new List<Step>();
        public Dictionary<string, string> hazards = new Dictionary<string, string>();
        public Dictionary<string, string> lateNotes = new Dictionary<string, string>();
        public List<Interrupt> interrupts = new List<Interrupt>();
        public List<Citation> standards = new List<Citation>();
        public string supportLine;
        public string gameSystem;
        public List<string> hits = new List<string>();
        public List<string> equipment = new List<string>();
    }

    [Serializable]
    public class ProgrammeStation { public string app; public string id; public string why; }

    [Serializable]
    public class Programme
    {
        public string id;
        public string name;
        public string union;
        public string certification;
        public string summary;
        public string completionRule;
        public List<ProgrammeStation> stations = new List<ProgrammeStation>();
        public List<string> guides = new List<string>();
    }

    /// The catalog: every station and programme under a Content/ folder.
    public class StationCatalog
    {
        public readonly Dictionary<string, Station> Stations = new Dictionary<string, Station>();
        public readonly Dictionary<string, Programme> Programmes = new Dictionary<string, Programme>();
        public string ContentRoot { get; private set; }

        /// Load from a folder holding Content/index.json (the package's own
        /// Content/ by default, or a copy under StreamingAssets).
        public static StationCatalog Load(string contentRoot)
        {
            var cat = new StationCatalog { ContentRoot = contentRoot };
            var index = MiniJson.Parse(File.ReadAllText(Path.Combine(contentRoot, "index.json"))) as Dictionary<string, object>;
            if (index == null) throw new InvalidDataException("Content/index.json did not parse");
            foreach (var row in MiniJson.List(index, "stations"))
            {
                var r = row as Dictionary<string, object>;
                if (r == null) continue;
                var st = LoadStation(Path.Combine(contentRoot, MiniJson.Str(r, "file")));
                cat.Stations[Key(st.app, st.id)] = st;
            }
            foreach (var row in MiniJson.List(index, "programmes"))
            {
                var r = row as Dictionary<string, object>;
                if (r == null) continue;
                var p = LoadProgramme(Path.Combine(contentRoot, MiniJson.Str(r, "file")));
                cat.Programmes[p.id] = p;
            }
            return cat;
        }

        public static string Key(string app, string id) { return (app ?? "smartcity") + "/" + id; }

        public Station Get(string id, string app = "smartcity")
        {
            Station s;
            return Stations.TryGetValue(Key(app, id), out s) ? s : null;
        }

        public static Station LoadStation(string path)
        {
            var d = MiniJson.Parse(File.ReadAllText(path)) as Dictionary<string, object>;
            if (d == null) throw new InvalidDataException(path + " did not parse");
            var st = new Station
            {
                app = MiniJson.Str(d, "app"), id = MiniJson.Str(d, "id"), title = MiniJson.Str(d, "title"), name = MiniJson.Str(d, "name"),
                tagline = MiniJson.Str(d, "tagline"), category = MiniJson.Str(d, "category"), domain = MiniJson.Str(d, "domain"),
                trade = MiniJson.Str(d, "trade"), certification = MiniJson.Str(d, "certification"), district = MiniJson.Str(d, "district"),
                flat = MiniJson.Bool(d, "flat"), parSeconds = MiniJson.Num(d, "parSeconds", 150f), supportLine = MiniJson.Str(d, "supportLine"),
            };
            foreach (var p in MiniJson.List(d, "programmes")) st.programmes.Add(p as string);
            st.hazards = MiniJson.StringMap(d, "hazards");
            st.lateNotes = MiniJson.StringMap(d, "lateNotes");
            foreach (var row in MiniJson.List(d, "steps"))
            {
                var s = row as Dictionary<string, object>;
                if (s == null) continue;
                var step = new Step
                {
                    id = MiniJson.Str(s, "id"), kind = MiniJson.Str(s, "kind"), target = MiniJson.Str(s, "target"), title = MiniJson.Str(s, "title"),
                    prompt = MiniJson.Str(s, "prompt") ?? MiniJson.Str(s, "cue"), why = MiniJson.Str(s, "why"), anyOrder = MiniJson.Bool(s, "anyOrder"),
                    outOfOrderNote = MiniJson.Str(s, "outOfOrderNote"), seconds = MiniJson.Num(s, "seconds", 0f), holdBreakNote = MiniJson.Str(s, "holdBreakNote"),
                    gauge = s.ContainsKey("gauge") ? s["gauge"] as Dictionary<string, object> : null,
                    track = s.ContainsKey("track") ? s["track"] as Dictionary<string, object> : null,
                    turn = s.ContainsKey("turn") ? s["turn"] as Dictionary<string, object> : null,
                    drag = s.ContainsKey("drag") ? s["drag"] as Dictionary<string, object> : null,
                    drive = s.ContainsKey("drive") ? s["drive"] as Dictionary<string, object> : null,
                };
                foreach (var t in MiniJson.List(s, "targets")) step.targets.Add(t as string);
                step.itemNames = MiniJson.StringMap(s, "itemNames");
                step.itemNotes = MiniJson.StringMap(s, "itemNotes");
                step.decoyNotes = MiniJson.StringMap(s, "decoyNotes");
                st.steps.Add(step);
            }
            foreach (var row in MiniJson.List(d, "interrupts"))
            {
                var i = row as Dictionary<string, object>;
                if (i == null) continue;
                st.interrupts.Add(new Interrupt
                {
                    id = MiniJson.Str(i, "id"), after = MiniJson.Str(i, "after"), delay = MiniJson.Num(i, "delay", 3f), seconds = MiniJson.Num(i, "seconds", 12f),
                    alert = MiniJson.Str(i, "alert"), cue = MiniJson.Str(i, "cue"), target = MiniJson.Str(i, "target"), why = MiniJson.Str(i, "why"),
                    missNote = MiniJson.Str(i, "missNote"), wrongNote = MiniJson.Str(i, "wrongNote"),
                });
            }
            var cit = d.ContainsKey("citations") ? d["citations"] as Dictionary<string, object> : null;
            if (cit != null)
            {
                foreach (var row in MiniJson.List(cit, "standards"))
                {
                    var c = row as Dictionary<string, object>;
                    if (c == null) continue;
                    st.standards.Add(new Citation { id = MiniJson.Str(c, "id"), body = MiniJson.Str(c, "body"), title = MiniJson.Str(c, "title"), citedAs = MiniJson.Str(c, "citedAs") });
                }
            }
            var game = d.ContainsKey("game") ? d["game"] as Dictionary<string, object> : null;
            if (game != null) st.gameSystem = MiniJson.Str(game, "system");
            var scene = d.ContainsKey("scene") ? d["scene"] as Dictionary<string, object> : null;
            if (scene != null)
            {
                foreach (var h in MiniJson.List(scene, "hits")) st.hits.Add(h as string);
                foreach (var row in MiniJson.List(scene, "equipment"))
                {
                    var e = row as Dictionary<string, object>;
                    if (e != null) st.equipment.Add(MiniJson.Str(e, "kit") + "/" + MiniJson.Str(e, "builder"));
                }
            }
            return st;
        }

        public static Programme LoadProgramme(string path)
        {
            var d = MiniJson.Parse(File.ReadAllText(path)) as Dictionary<string, object>;
            if (d == null) throw new InvalidDataException(path + " did not parse");
            var p = new Programme
            {
                id = MiniJson.Str(d, "id"), name = MiniJson.Str(d, "name"), union = MiniJson.Str(d, "union"), certification = MiniJson.Str(d, "certification"),
                summary = MiniJson.Str(d, "summary"), completionRule = MiniJson.Str(d, "completionRule"),
            };
            foreach (var g in MiniJson.List(d, "guides")) p.guides.Add(g as string);
            foreach (var row in MiniJson.List(d, "stations"))
            {
                var s = row as Dictionary<string, object>;
                if (s != null) p.stations.Add(new ProgrammeStation { app = MiniJson.Str(s, "app"), id = MiniJson.Str(s, "id"), why = MiniJson.Str(s, "why") });
            }
            return p;
        }
    }

    /// A small strict JSON reader and writer: objects become
    /// Dictionary&lt;string, object&gt;, arrays List&lt;object&gt;, numbers double,
    /// plus string, bool and null. Enough for the content files, with no
    /// dependency on a JSON package.
    public static class MiniJson
    {
        public static object Parse(string json)
        {
            int i = 0;
            var v = ParseValue(json, ref i);
            SkipWs(json, ref i);
            if (i != json.Length) throw new FormatException("trailing characters at " + i);
            return v;
        }

        public static string Str(Dictionary<string, object> d, string key)
        {
            object v;
            return d != null && d.TryGetValue(key, out v) ? v as string : null;
        }
        public static bool Bool(Dictionary<string, object> d, string key)
        {
            object v;
            return d != null && d.TryGetValue(key, out v) && v is bool && (bool)v;
        }
        public static float Num(Dictionary<string, object> d, string key, float fallback)
        {
            object v;
            return d != null && d.TryGetValue(key, out v) && v is double ? (float)(double)v : fallback;
        }
        public static List<object> List(Dictionary<string, object> d, string key)
        {
            object v;
            return d != null && d.TryGetValue(key, out v) && v is List<object> ? (List<object>)v : new List<object>();
        }
        public static Dictionary<string, string> StringMap(Dictionary<string, object> d, string key)
        {
            var out = new Dictionary<string, string>();
            object v;
            if (d == null || !d.TryGetValue(key, out v)) return out;
            var m = v as Dictionary<string, object>;
            if (m == null) return out;
            foreach (var kv in m) out[kv.Key] = kv.Value as string;
            return out;
        }
        public static List<float> Floats(Dictionary<string, object> d, string key)
        {
            var out = new List<float>();
            foreach (var x in List(d, key)) if (x is double) out.Add((float)(double)x);
            return out;
        }

        static void SkipWs(string s, ref int i) { while (i < s.Length && (s[i] == ' ' || s[i] == '\\t' || s[i] == '\\n' || s[i] == '\\r')) i++; }

        static object ParseValue(string s, ref int i)
        {
            SkipWs(s, ref i);
            if (i >= s.Length) throw new FormatException("unexpected end");
            char c = s[i];
            if (c == '{') return ParseObject(s, ref i);
            if (c == '[') return ParseArray(s, ref i);
            if (c == '"') return ParseString(s, ref i);
            if (c == 't') { Expect(s, ref i, "true"); return true; }
            if (c == 'f') { Expect(s, ref i, "false"); return false; }
            if (c == 'n') { Expect(s, ref i, "null"); return null; }
            return ParseNumber(s, ref i);
        }

        static void Expect(string s, ref int i, string word)
        {
            if (string.CompareOrdinal(s, i, word, 0, word.Length) != 0) throw new FormatException("expected " + word + " at " + i);
            i += word.Length;
        }

        static Dictionary<string, object> ParseObject(string s, ref int i)
        {
            var d = new Dictionary<string, object>();
            i++;
            SkipWs(s, ref i);
            if (i < s.Length && s[i] == '}') { i++; return d; }
            while (true)
            {
                SkipWs(s, ref i);
                var key = ParseString(s, ref i);
                SkipWs(s, ref i);
                if (i >= s.Length || s[i] != ':') throw new FormatException("expected : at " + i);
                i++;
                d[key] = ParseValue(s, ref i);
                SkipWs(s, ref i);
                if (i >= s.Length) throw new FormatException("unterminated object");
                if (s[i] == ',') { i++; continue; }
                if (s[i] == '}') { i++; return d; }
                throw new FormatException("expected , or } at " + i);
            }
        }

        static List<object> ParseArray(string s, ref int i)
        {
            var list = new List<object>();
            i++;
            SkipWs(s, ref i);
            if (i < s.Length && s[i] == ']') { i++; return list; }
            while (true)
            {
                list.Add(ParseValue(s, ref i));
                SkipWs(s, ref i);
                if (i >= s.Length) throw new FormatException("unterminated array");
                if (s[i] == ',') { i++; continue; }
                if (s[i] == ']') { i++; return list; }
                throw new FormatException("expected , or ] at " + i);
            }
        }

        static string ParseString(string s, ref int i)
        {
            if (s[i] != '"') throw new FormatException("expected string at " + i);
            i++;
            var sb = new StringBuilder();
            while (i < s.Length)
            {
                char c = s[i++];
                if (c == '"') return sb.ToString();
                if (c != '\\\\') { sb.Append(c); continue; }
                if (i >= s.Length) break;
                char e = s[i++];
                switch (e)
                {
                    case '"': sb.Append('"'); break;
                    case '\\\\': sb.Append('\\\\'); break;
                    case '/': sb.Append('/'); break;
                    case 'b': sb.Append('\\b'); break;
                    case 'f': sb.Append('\\f'); break;
                    case 'n': sb.Append('\\n'); break;
                    case 'r': sb.Append('\\r'); break;
                    case 't': sb.Append('\\t'); break;
                    case 'u':
                        if (i + 4 > s.Length) throw new FormatException("bad unicode escape");
                        sb.Append((char)int.Parse(s.Substring(i, 4), NumberStyles.HexNumber, CultureInfo.InvariantCulture));
                        i += 4;
                        break;
                    default: throw new FormatException("bad escape at " + i);
                }
            }
            throw new FormatException("unterminated string");
        }

        static object ParseNumber(string s, ref int i)
        {
            int start = i;
            if (i < s.Length && (s[i] == '-' || s[i] == '+')) i++;
            while (i < s.Length && (char.IsDigit(s[i]) || s[i] == '.' || s[i] == 'e' || s[i] == 'E' || s[i] == '-' || s[i] == '+')) i++;
            double v;
            if (!double.TryParse(s.Substring(start, i - start), NumberStyles.Float, CultureInfo.InvariantCulture, out v)) throw new FormatException("bad number at " + start);
            return v;
        }

        /// Serialise a value the way Parse reads it (objects, lists, strings,
        /// numbers, bools, null), with object keys in the order given.
        public static string Write(object v)
        {
            var sb = new StringBuilder();
            WriteValue(sb, v);
            return sb.ToString();
        }

        static void WriteValue(StringBuilder sb, object v)
        {
            if (v == null) { sb.Append("null"); return; }
            if (v is string) { WriteString(sb, (string)v); return; }
            if (v is bool) { sb.Append((bool)v ? "true" : "false"); return; }
            if (v is int || v is long) { sb.Append(Convert.ToString(v, CultureInfo.InvariantCulture)); return; }
            if (v is float || v is double) { sb.Append(Convert.ToDouble(v).ToString("R", CultureInfo.InvariantCulture)); return; }
            var dict = v as Dictionary<string, object>;
            if (dict != null)
            {
                sb.Append('{');
                bool first = true;
                foreach (var kv in dict)
                {
                    if (!first) sb.Append(',');
                    first = false;
                    WriteString(sb, kv.Key);
                    sb.Append(':');
                    WriteValue(sb, kv.Value);
                }
                sb.Append('}');
                return;
            }
            var list = v as System.Collections.IEnumerable;
            if (list != null)
            {
                sb.Append('[');
                bool first = true;
                foreach (var x in list)
                {
                    if (!first) sb.Append(',');
                    first = false;
                    WriteValue(sb, x);
                }
                sb.Append(']');
                return;
            }
            WriteString(sb, v.ToString());
        }

        static void WriteString(StringBuilder sb, string s)
        {
            sb.Append('"');
            foreach (char c in s)
            {
                switch (c)
                {
                    case '"': sb.Append("\\\\\\""); break;
                    case '\\\\': sb.Append("\\\\\\\\"); break;
                    case '\\n': sb.Append("\\\\n"); break;
                    case '\\r': sb.Append("\\\\r"); break;
                    case '\\t': sb.Append("\\\\t"); break;
                    default:
                        if (c < ' ') sb.Append("\\\\u").Append(((int)c).ToString("x4"));
                        else sb.Append(c);
                        break;
                }
            }
            sb.Append('"');
        }
    }
}
`;

const STATION_RUNNER_CS = `// SmartCiti.X content bridge — the procedure engine.
//
// A MonoBehaviour state machine over the nine step kinds, with the same
// scoring and pass rules WebXR/shared/game.js applies (Session), so a run in
// Unity scores what the same run scores in the browser:
//
//   select   — touch the step's target; anything else is a wrong step, or an
//              unsafe action if it is one of the station's hazards (−50).
//   sequence — the targets in order (anyOrder: in any order); an out-of-order
//              target costs a wrong step (−25).
//   find     — a sequence in any order.
//   gauge    — a marker sweeps 0..1; commit inside the green band, bonus by
//              closeness to the centre; outside the band is a wrong step.
//   hold     — hold the target for \`seconds\`; releasing early resets the clock
//              and counts a hold break.
//   track    — press to drive a value up, release to let it fall; keep it in
//              the green band for \`seconds\` total.
//   turn     — rotate the target through \`turn.turns\` full turns.
//   drag     — carry the target and drop it within \`drag.radius\` metres of the
//              socket; a miss costs nothing and can be tried again.
//   drive    — follow the route inside the lane and the speed band; out of
//              either past the grace is unsafe; every check in its window.
//
// Interruptions fire \`delay\` seconds into the step they name and take the
// next thing the learner touches. Answering is worth 120 plus up to 60 for
// speed; a wrong response or a miss is an unsafe action.
//
// Pass rule (records.js): stars >= 2 and hazardHits == 0. Stars: 3 when no
// error and inside par, 2 when at most one error and inside 1.5 x par, else 1.
using System;
using System.Collections.Generic;
using UnityEngine;

namespace SmartCitiX
{
    public enum FeedbackKind { Ok, Partial, Warn, Danger }

    public class Feedback
    {
        public FeedbackKind kind;
        public string text;
        public int points;
        public bool hazard;
        public Feedback(FeedbackKind k, string t, int p = 0, bool h = false) { kind = k; text = t; points = p; hazard = h; }
    }

    public class StepLogEntry
    {
        public string id; public string title; public string kind; public float seconds; public int corrections; public int hazards; public bool clean; public int points;
    }

    public class InterruptLogEntry { public string id; public string alert; public string outcome; public float seconds; }

    public class StationRunner : MonoBehaviour
    {
        public const int StepPoints = ${SCORING.STEP_POINTS};
        public const int WrongStepPenalty = ${SCORING.WRONG_STEP_PENALTY};
        public const int HazardPenalty = ${SCORING.HAZARD_PENALTY};
        public const float MaxCombo = ${SCORING.MAX_COMBO}f;
        public const int InterruptPoints = ${SCORING.INTERRUPT_POINTS};
        public const int InterruptSpeedBonus = ${SCORING.INTERRUPT_SPEED_BONUS};
        public const float PreparedBonus = ${SCORING.PREPARED_BONUS}f;

        public Station station;
        public bool prepared;
        public bool tickInUpdate = true;

        public int Index { get; private set; }
        public int Score { get; private set; }
        public int Streak { get; private set; }
        public float PeakCombo { get; private set; }
        public int Errors { get; private set; }
        public int HazardHits { get; private set; }
        public int HoldBreaks { get; private set; }
        public float Elapsed { get; private set; }
        public bool Finished { get; private set; }
        public int Stars { get; private set; }
        public int TimeBonus { get; private set; }
        public int PreparedBonusPoints { get; private set; }
        public readonly List<StepLogEntry> StepLog = new List<StepLogEntry>();
        public readonly List<InterruptLogEntry> InterruptLog = new List<InterruptLogEntry>();
        public readonly List<float> GaugeScores = new List<float>();

        public event Action<Step> OnStep;
        public event Action<Feedback> OnFeedback;
        public event Action<string> OnHazard;
        public event Action<Interrupt> OnInterrupt;
        public event Action<Interrupt> OnInterruptEnd;
        public event Action<StationRunner> OnFinish;
        public event Action<DrivePose> OnDrive;

        // Live state for the current step.
        readonly List<string> sequence = new List<string>();
        float holdFor;
        bool holding;
        float stepStartedAt;
        int stepErrors, stepHazards;
        GaugeState gauge;
        TrackState track;
        TurnState turn;
        DriveState drive;
        readonly List<InterruptState> interrupts = new List<InterruptState>();
        InterruptState active;

        class GaugeState { public float t; public float dir = 1; public float speed = 0.85f; public float lo = 0.44f, hi = 0.62f; public bool committed; }
        class TrackState { public float v = 0.1f, lo = 0.42f, hi = 0.62f, rise = 0.62f, fall = 0.46f, drift = 0.1f, wobble, inBand; public int dropouts; public bool wasIn; }
        class TurnState { public float amount, required = 1f; }
        class InterruptState { public Interrupt it; public bool fired; public float? armedAt; public float firedAt; public string resolved; }
        class DriveCheck { public string kind; public float from, to; public bool done, missed; public string note; }
        public struct DrivePose { public float x, z, heading, s, total; public bool reverse; }
        class DriveState
        {
            public List<Vector2> path; public List<float> cum; public float total; public float lo, hi, laneWidth, grace, ramp, sceneRate, accel, maxSpeed, steerRate, driftK;
            public bool reverse; public Dictionary<string, string> controls; public Dictionary<string, string> forbid; public string laneNote, speedNote, wrongSignalNote;
            public List<DriveCheck> plan; public float s, speed, offset, throttle, steer, outLane, outBand, inBand, driven, quietUntil = -1f;
            public bool started, reachedBand, laneFlagged, bandFlagged, wasIn = true, braking; public float startedAt; public int dropouts;
        }

        public Step Current { get { return station != null && Index < station.steps.Count ? station.steps[Index] : null; } }
        public float Combo { get { return Mathf.Min(MaxCombo, 1f + Streak * 0.1f); } }
        public float Progress01 { get { return station == null || station.steps.Count == 0 ? 0f : (float)Index / station.steps.Count; } }
        public Interrupt ActiveInterrupt { get { return active != null ? active.it : null; } }
        public float Precision
        {
            get { if (GaugeScores.Count == 0) return 0f; float s = 0; foreach (var g in GaugeScores) s += g; return s / GaugeScores.Count; }
        }

        public void Begin(Station st, bool wasPrepared = false)
        {
            station = st;
            prepared = wasPrepared;
            Index = 0; Score = 0; Streak = 0; PeakCombo = 1f; Errors = 0; HazardHits = 0; HoldBreaks = 0; Elapsed = 0; Finished = false; Stars = 0;
            StepLog.Clear(); InterruptLog.Clear(); GaugeScores.Clear();
            interrupts.Clear();
            foreach (var it in st.interrupts) interrupts.Add(new InterruptState { it = it });
            active = null;
            EnterStep();
        }

        void Update() { if (tickInUpdate && station != null && !Finished) Tick(Time.deltaTime); }

        void EnterStep()
        {
            var step = Current;
            stepStartedAt = Elapsed; stepErrors = 0; stepHazards = 0;
            sequence.Clear(); holdFor = 0; holding = false; gauge = null; track = null; turn = null; drive = null;
            if (step == null) return;
            ArmInterrupts(step.id);
            if (step.kind == "track")
            {
                track = new TrackState();
                var cfg = step.track;
                if (cfg != null)
                {
                    track.v = MiniJson.Num(cfg, "start", 0.1f); track.rise = MiniJson.Num(cfg, "rise", 0.62f); track.fall = MiniJson.Num(cfg, "fall", 0.46f); track.drift = MiniJson.Num(cfg, "drift", 0.1f);
                    var g = MiniJson.Floats(cfg, "green"); if (g.Count == 2) { track.lo = g[0]; track.hi = g[1]; }
                }
                track.wobble = UnityEngine.Random.value * 6f;
            }
            if (step.kind == "gauge")
            {
                gauge = new GaugeState();
                if (step.gauge != null)
                {
                    gauge.speed = MiniJson.Num(step.gauge, "speed", 0.85f);
                    var g = MiniJson.Floats(step.gauge, "green"); if (g.Count == 2) { gauge.lo = g[0]; gauge.hi = g[1]; }
                }
            }
            if (step.kind == "turn") turn = new TurnState { required = step.turn != null ? MiniJson.Num(step.turn, "turns", 1f) : 1f };
            if (step.kind == "drive") drive = MakeDrive(step);
            if (OnStep != null) OnStep(step);
            if (drive != null && OnDrive != null) OnDrive(Pose(drive));
        }

        // ------------------------------------------------------------ input

        /// The learner touched an interactable. Returns the feedback, or null when the touch was harmless.
        public Feedback Select(string hitId)
        {
            if (Finished || Current == null) return null;
            if (active != null) return ResolveInterrupt(hitId);
            var step = Current;
            switch (step.kind)
            {
                case "sequence": return SelectInSequence(hitId, step, step.anyOrder);
                case "find": return SelectInSequence(hitId, step, true);
                case "gauge":
                    if (hitId == step.target || hitId == "gauge-commit") return CommitGauge();
                    return Wrong(hitId, "Set the gauge first, then commit the reading.");
                case "hold":
                case "track":
                case "turn":
                case "drag":
                    return hitId == step.target ? null : Wrong(hitId);
                case "drive":
                    if (hitId == step.target || (drive != null && drive.controls.ContainsValue(hitId))) return null;
                    return Wrong(hitId);
                case "select":
                default:
                    return hitId == step.target ? Advance(StepPoints) : Wrong(hitId);
            }
        }

        Feedback SelectInSequence(string hitId, Step step, bool anyOrder)
        {
            if (sequence.Contains(hitId)) return Emit(new Feedback(FeedbackKind.Partial, "Already verified — " + Name(step, hitId) + "."));
            string expected = anyOrder ? (step.targets.Contains(hitId) ? hitId : null) : (sequence.Count < step.targets.Count ? step.targets[sequence.Count] : null);
            if (hitId == expected)
            {
                sequence.Add(hitId);
                if (sequence.Count == step.targets.Count) return Advance(StepPoints + 20 * (step.targets.Count - 1));
                string note; step.itemNotes.TryGetValue(hitId, out note);
                return Emit(new Feedback(FeedbackKind.Partial, sequence.Count + "/" + step.targets.Count + " — " + Name(step, hitId) + "." + (note != null ? " " + note : " Keep going.")));
            }
            string decoy; if (step.decoyNotes.TryGetValue(hitId, out decoy)) return Wrong(hitId, decoy);
            if (step.targets.Contains(hitId)) return Wrong(hitId, step.outOfOrderNote ?? "Out of order. Sequence matters here — reset and take them in the required order.", true);
            return Wrong(hitId);
        }

        static string Name(Step step, string hitId) { string n; return step.itemNames.TryGetValue(hitId, out n) ? n : hitId; }

        /// Hold and track steps: the target is being pressed (true) or released (false).
        public void SetHolding(bool on)
        {
            var step = Current;
            if (step == null) return;
            if (step.kind == "track") { holding = on; return; }
            if (step.kind != "hold") return;
            holding = on;
            if (!on && holdFor > 0 && holdFor < step.seconds)
            {
                holdFor = 0; HoldBreaks++;
                Emit(new Feedback(FeedbackKind.Warn, step.holdBreakNote ?? "Released too early — start the full duration again."));
            }
        }

        public float GaugeT { get { return gauge != null ? gauge.t : 0f; } }
        public float TrackValue { get { return track != null ? track.v : 0f; } }
        public float TurnAmount { get { return turn != null ? turn.amount : 0f; } }

        public Feedback CommitGauge()
        {
            var step = Current;
            if (gauge == null || gauge.committed) return null;
            float t = gauge.t;
            gauge.committed = true;
            if (t < gauge.lo || t > gauge.hi)
            {
                gauge.committed = false;
                string miss = step.gauge != null ? MiniJson.Str(step.gauge, "missNote") : null;
                return Wrong(step.target, miss ?? "Outside the acceptable band. Watch the marker and commit inside the green zone.");
            }
            float centre = (gauge.lo + gauge.hi) / 2f, half = (gauge.hi - gauge.lo) / 2f;
            float accuracy = Mathf.Max(0f, 1f - Mathf.Abs(t - centre) / half);
            GaugeScores.Add(accuracy);
            int bonus = Mathf.RoundToInt(50f * accuracy);
            return Advance(StepPoints + bonus, bonus >= 40 ? "Dead centre." : null);
        }

        /// Turn steps: a signed fraction of one full turn. Turning back is free.
        public Feedback Rotate(string hitId, float deltaTurns)
        {
            var step = Current;
            if (Finished || step == null || step.kind != "turn" || hitId != step.target || turn == null) return null;
            turn.amount = Mathf.Clamp(turn.amount + deltaTurns, 0f, turn.required);
            return turn.amount >= turn.required ? Advance(StepPoints) : null;
        }

        public bool CanDrag(string hitId) { var s = Current; return !Finished && s != null && s.kind == "drag" && hitId == s.target; }

        /// Drag steps: the carried object was released \`distance\` metres from the socket (null for no useful distance).
        public Feedback DropAt(string hitId, float? distance)
        {
            var step = Current;
            if (Finished || step == null || step.kind != "drag" || hitId != step.target) return null;
            float radius = step.drag != null ? MiniJson.Num(step.drag, "radius", 0.35f) : 0.35f;
            if (distance.HasValue && distance.Value <= radius) return Advance(StepPoints);
            string miss = step.drag != null ? MiniJson.Str(step.drag, "missNote") : null;
            return Emit(new Feedback(FeedbackKind.Partial, miss ?? "Not quite lined up — line it up with the marker and try again."));
        }

        // ------------------------------------------------------------ drive

        DriveState MakeDrive(Step step)
        {
            var cfg = step.drive ?? new Dictionary<string, object>();
            var d = new DriveState { path = new List<Vector2>(), cum = new List<float> { 0f }, controls = new Dictionary<string, string>(), forbid = new Dictionary<string, string>(), plan = new List<DriveCheck>() };
            foreach (var p in MiniJson.List(cfg, "path"))
            {
                var pt = p as List<object>;
                if (pt != null && pt.Count >= 2 && pt[0] is double && pt[1] is double) d.path.Add(new Vector2((float)(double)pt[0], (float)(double)pt[1]));
            }
            if (d.path.Count < 2) { d.path.Clear(); d.path.Add(new Vector2(0, 0)); d.path.Add(new Vector2(0, 4)); }
            for (int i = 1; i < d.path.Count; i++) d.cum.Add(d.cum[i - 1] + Vector2.Distance(d.path[i - 1], d.path[i]));
            d.total = d.cum[d.cum.Count - 1];
            var band = MiniJson.Floats(cfg, "speedBand");
            d.lo = band.Count == 2 ? band[0] : 3f; d.hi = band.Count == 2 ? band[1] : 8f;
            float width = Mathf.Max(1f, d.hi - d.lo);
            d.laneWidth = MiniJson.Num(cfg, "laneWidth", 1.4f);
            d.reverse = MiniJson.Bool(cfg, "reverse");
            d.grace = MiniJson.Num(cfg, "graceSeconds", 1.5f);
            d.ramp = MiniJson.Num(cfg, "rampSeconds", 4f);
            d.sceneRate = MiniJson.Num(cfg, "sceneRate", 0.2f);
            d.accel = MiniJson.Num(cfg, "accel", Mathf.Max(2f, width * 1.2f));
            d.maxSpeed = MiniJson.Num(cfg, "maxSpeed", d.hi * 1.6f + 2f);
            d.steerRate = MiniJson.Num(cfg, "steerRate", d.laneWidth * 0.9f);
            d.driftK = MiniJson.Num(cfg, "driftK", 0.35f);
            d.controls = MiniJson.StringMap(cfg, "controls");
            d.forbid = MiniJson.StringMap(cfg, "forbid");
            d.laneNote = MiniJson.Str(cfg, "laneNote"); d.speedNote = MiniJson.Str(cfg, "speedNote"); d.wrongSignalNote = MiniJson.Str(cfg, "wrongSignalNote");
            float w = MiniJson.Num(cfg, "checkWindow", Mathf.Max(1.2f, d.total * 0.12f));
            var notes = MiniJson.StringMap(cfg, "checkNotes");
            foreach (var c in MiniJson.List(cfg, "checks"))
            {
                var cd = c as Dictionary<string, object>;
                if (cd == null) continue;
                int at = Mathf.Clamp((int)MiniJson.Num(cd, "at", 0f), 0, d.cum.Count - 1);
                float dist = d.cum[at];
                string kind = MiniJson.Str(cd, "kind");
                string note = MiniJson.Str(cd, "note"); if (note == null) notes.TryGetValue(kind ?? "", out note);
                d.plan.Add(new DriveCheck { kind = kind, from = Mathf.Max(0f, dist - w), to = Mathf.Min(d.total, dist + w), note = note });
            }
            return d;
        }

        DrivePose Pose(DriveState d)
        {
            int n = d.path.Count;
            float dist = Mathf.Clamp(d.s, 0f, d.total);
            int i = 1; while (i < n - 1 && d.cum[i] < dist) i++;
            Vector2 a = d.path[i - 1], b = d.path[i];
            float len = Mathf.Max(1e-6f, d.cum[i] - d.cum[i - 1]);
            float u = (dist - d.cum[i - 1]) / len;
            float tx = (b.x - a.x) / len, tz = (b.y - a.y) / len;
            float px = a.x + (b.x - a.x) * u, pz = a.y + (b.y - a.y) * u;
            float heading = Mathf.Atan2(tx, tz);
            if (d.reverse) heading = Mathf.Repeat(heading + Mathf.PI + Mathf.PI, Mathf.PI * 2f) - Mathf.PI;
            return new DrivePose { x = px + -tz * d.offset, z = pz + tx * d.offset, heading = heading, s = d.s, total = d.total, reverse = d.reverse };
        }

        float Curvature(DriveState d)
        {
            // Turn rate around s, from the headings a little either side.
            float h = 0.5f;
            float s0 = Mathf.Clamp(d.s - h, 0f, d.total), s1 = Mathf.Clamp(d.s + h, 0f, d.total);
            if (s1 - s0 < 1e-4f) return 0f;
            var save = d.s; d.s = s0; float h0 = Pose(d).heading; d.s = s1; float h1 = Pose(d).heading; d.s = save;
            float da = Mathf.Repeat(h1 - h0 + Mathf.PI, Mathf.PI * 2f) - Mathf.PI;
            return da / (s1 - s0);
        }

        /// Continuous vehicle input each frame: throttle in [-1, 1] (below zero brakes), steer in [-1, 1] (positive is right).
        public Feedback DriveInput(float throttle, float steer, bool brake = false)
        {
            var d = drive;
            if (Finished || d == null || Current == null || Current.kind != "drive") return null;
            float t = brake ? -1f : Mathf.Clamp(throttle, -1f, 1f);
            d.throttle = t; d.steer = Mathf.Clamp(steer, -1f, 1f);
            if (!d.started && t > 0.05f) { d.started = true; d.startedAt = Elapsed; }
            bool braking = t < -0.4f;
            Feedback fb = null;
            if (braking && !d.braking) fb = DriveControl("brake");
            d.braking = braking;
            return fb;
        }

        public Feedback DriveControl(string name)
        {
            var d = drive;
            if (d == null || active == null) return null;
            string id; if (!d.controls.TryGetValue(name, out id) || id != active.it.target) return null;
            return ResolveInterrupt(id);
        }

        /// A discrete check on a drive step (mirror-left, signal-right, horn, lights, gear-up ...), credited inside its window.
        public Feedback DriveCheckDone(string kind)
        {
            var d = drive;
            var step = Current;
            if (Finished || d == null || step == null || step.kind != "drive" || string.IsNullOrEmpty(kind)) return null;
            string ctl;
            if (active != null && d.controls.TryGetValue(kind, out ctl) && ctl == active.it.target) return ResolveInterrupt(ctl);
            DriveCheck due = null;
            foreach (var c in d.plan) if (!c.done && !c.missed && c.kind == kind && d.s >= c.from && d.s <= c.to) { due = c; break; }
            string forbidden; if (d.forbid.TryGetValue(kind, out forbidden) && due == null) return Wrong(step.target, forbidden);
            if (due != null)
            {
                due.done = true;
                int left = 0; foreach (var c in d.plan) if (!c.done && !c.missed) left++;
                return Emit(new Feedback(FeedbackKind.Partial, kind + " — on time." + (due.note != null ? " " + due.note : left > 0 ? " Keep driving." : "")));
            }
            string opposite = kind == "signal-left" ? "signal-right" : kind == "signal-right" ? "signal-left" : null;
            if (opposite != null)
                foreach (var c in d.plan)
                    if (!c.done && !c.missed && c.kind == opposite && d.s >= c.from && d.s <= c.to)
                        return Wrong(step.target, d.wrongSignalNote ?? "Wrong signal. A signal tells every driver and pedestrian round you where you are about to go, and this one told them the opposite.");
            return Emit(new Feedback(FeedbackKind.Partial, "Nothing on this stretch calls for the " + kind + "."));
        }

        Feedback DriveHazard(string note)
        {
            var step = Current;
            Score = Mathf.Max(0, Score - HazardPenalty); Streak = 0; Errors++; stepErrors++; stepHazards++; HazardHits++;
            if (OnHazard != null) OnHazard(step != null ? step.target : null);
            return Emit(new Feedback(FeedbackKind.Danger, "−" + HazardPenalty + " — Unsafe driving. " + note, 0, true));
        }

        Feedback DriveMissed(DriveCheck c)
        {
            Score = Mathf.Max(0, Score - WrongStepPenalty); Streak = 0; Errors++; stepErrors++;
            return Emit(new Feedback(FeedbackKind.Warn, "−" + WrongStepPenalty + " — Missed the " + c.kind + ". " + (c.note ?? "The " + c.kind + " belonged back there, before the point on the route that needed it.")));
        }

        void TickDrive(float dt)
        {
            var d = drive; var step = Current;
            float left = dt;
            while (left > 1e-9f && Current == step && !Finished)
            {
                float h = Mathf.Min(0.05f, left); left -= h;
                if (!d.started) continue;
                float t = d.throttle, coast = d.accel * 0.3f;
                d.speed += (t >= 0 ? t * d.accel - coast : t * d.accel * 2.5f) * h;
                d.speed = Mathf.Clamp(d.speed, 0f, d.maxSpeed);
                float ds = d.speed * d.sceneRate * h;
                d.s = Mathf.Min(d.total, d.s + ds);
                float curvature = Curvature(d);
                float drift = curvature * d.speed * d.sceneRate * d.driftK + Mathf.Sin((Elapsed + d.s) * 1.3f) * 0.04f * d.laneWidth * (d.speed > 0.1f ? 1f : 0f);
                d.offset = Mathf.Clamp(d.offset + (d.steer * d.steerRate + drift) * h, -d.laneWidth * 1.5f, d.laneWidth * 1.5f);
                d.driven += h;
                bool quiet = active != null || Elapsed < d.quietUntil;
                bool inLane = Mathf.Abs(d.offset) <= d.laneWidth / 2f;
                if (d.speed >= d.lo && d.speed <= d.hi) d.reachedBand = true;
                bool early = !d.reachedBand && Elapsed - d.startedAt < d.ramp;
                bool inBandNow = d.speed <= d.hi && (d.speed >= d.lo || early);
                bool inside = inLane && inBandNow;
                if (inside) d.inBand += h; else if (d.wasIn) { d.dropouts++; HoldBreaks++; }
                d.wasIn = inside;
                if (!inLane && !quiet)
                {
                    d.outLane += h;
                    if (d.outLane > d.grace && !d.laneFlagged) { d.laneFlagged = true; DriveHazard(d.laneNote ?? "You left the lane and stayed out of it. On a real road that is the curb, the next lane's traffic or the ditch."); }
                }
                else if (inLane) { d.outLane = 0; d.laneFlagged = false; }
                if (!inBandNow && !quiet)
                {
                    d.outBand += h;
                    if (d.outBand > d.grace && !d.bandFlagged)
                    {
                        d.bandFlagged = true;
                        DriveHazard(d.speedNote ?? (d.speed > d.hi
                            ? "Too fast for this stretch, and for long enough to matter. Speed is the one thing that turns every other mistake into a crash."
                            : "Too slow for this stretch, and for long enough to matter: a vehicle far under the flow of traffic is one the traffic behind has to swerve round."));
                    }
                }
                else if (inBandNow) { d.outBand = 0; d.bandFlagged = false; }
                foreach (var c in d.plan) if (!c.done && !c.missed && d.s > c.to) { c.missed = true; DriveMissed(c); }
                if (d.s >= d.total - 1e-6f && Current == step)
                {
                    foreach (var c in d.plan) if (!c.done && !c.missed) { c.missed = true; DriveMissed(c); }
                    if (OnDrive != null) OnDrive(Pose(d));
                    float share = d.driven > 0 ? d.inBand / d.driven : 1f;
                    GaugeScores.Add(Mathf.Clamp01(share));
                    int clean = Mathf.Max(0, 40 - d.dropouts * 12);
                    Advance(StepPoints + 20 + clean, d.dropouts == 0 ? "In the lane and in the band the whole way." : null);
                    return;
                }
                if (OnDrive != null) OnDrive(Pose(d));
            }
        }

        // -------------------------------------------------------- scoring

        Feedback Emit(Feedback f) { if (OnFeedback != null) OnFeedback(f); return f; }

        Feedback Advance(int points, string extraNote = null)
        {
            var step = Current;
            int earned = Mathf.RoundToInt(points * Combo);
            Score += earned; Streak++; PeakCombo = Mathf.Max(PeakCombo, Combo);
            StepLog.Add(new StepLogEntry
            {
                id = step.id, title = step.title, kind = step.kind, seconds = Mathf.Max(0f, Mathf.Round((Elapsed - stepStartedAt) * 10f) / 10f),
                corrections = stepErrors, hazards = stepHazards, clean = stepErrors == 0 && stepHazards == 0, points = earned,
            });
            var fb = Emit(new Feedback(FeedbackKind.Ok, "+" + earned + " — " + step.title + ". " + (extraNote != null ? extraNote + " " : "") + step.why, earned));
            Index++;
            if (Index >= station.steps.Count) Finish(); else EnterStep();
            return fb;
        }

        Step LaterStep(string hitId)
        {
            for (int i = Index + 1; i < station.steps.Count; i++)
            {
                var s = station.steps[i];
                if (s.target == hitId || s.targets.Contains(hitId)) return s;
            }
            return null;
        }

        Feedback Wrong(string hitId, string note = null, bool isOrderError = false)
        {
            string hazard; station.hazards.TryGetValue(hitId ?? "", out hazard);
            var later = hazard != null ? null : LaterStep(hitId);
            int penalty = hazard != null ? HazardPenalty : WrongStepPenalty;
            Score = Mathf.Max(0, Score - penalty); Streak = 0; Errors++; stepErrors++;
            if (hazard != null) stepHazards++;
            string lateNote = null;
            if (later != null && !station.lateNotes.TryGetValue(hitId, out lateNote)) lateNote = "That control belongs to a later step. " + (Current != null ? Current.prompt : "");
            string body = hazard ?? note ?? lateNote ?? ("That is not the next control. " + (Current != null ? Current.prompt : ""));
            string label = hazard != null ? "Unsafe action" : isOrderError ? "Out of sequence" : later != null ? "Too early" : "Wrong step";
            if (hazard != null) { HazardHits++; if (OnHazard != null) OnHazard(hitId); }
            return Emit(new Feedback(hazard != null ? FeedbackKind.Danger : FeedbackKind.Warn, "−" + penalty + " — " + label + ". " + body, 0, hazard != null));
        }

        // --------------------------------------------------- interruptions

        void ArmInterrupts(string stepId)
        {
            foreach (var s in interrupts)
            {
                if (!s.fired && s.armedAt.HasValue && s.it.after != stepId) s.armedAt = null;
                if (!s.fired && s.it.after == stepId) s.armedAt = Elapsed + s.it.delay;
            }
        }

        void TickInterrupts()
        {
            if (active == null)
            {
                foreach (var s in interrupts)
                {
                    if (!s.fired && s.armedAt.HasValue && Elapsed >= s.armedAt.Value)
                    {
                        s.fired = true; s.firedAt = Elapsed; active = s;
                        if (OnInterrupt != null) OnInterrupt(s.it);
                        break;
                    }
                }
            }
            if (active == null) return;
            if (active.firedAt + active.it.seconds - Elapsed <= 0f) ResolveInterrupt(null);
        }

        public float InterruptSecondsLeft { get { return active == null ? 0f : Mathf.Max(0f, active.firedAt + active.it.seconds - Elapsed); } }

        Feedback ResolveInterrupt(string hitId)
        {
            var s = active;
            if (s == null) return null;
            active = null;
            float took = Mathf.Round((Elapsed - s.firedAt) * 10f) / 10f;
            bool ok = hitId != null && hitId == s.it.target;
            if (drive != null) { drive.quietUntil = Elapsed + 3f; drive.outBand = 0; drive.outLane = 0; }
            s.resolved = ok ? "answered" : hitId != null ? "wrong" : "missed";
            InterruptLog.Add(new InterruptLogEntry { id = s.it.id, alert = s.it.alert, outcome = s.resolved, seconds = took });
            Feedback fb;
            if (ok)
            {
                float speed = Mathf.Max(0f, 1f - took / s.it.seconds);
                int points = InterruptPoints + Mathf.RoundToInt(speed * InterruptSpeedBonus);
                Score += points;
                fb = new Feedback(FeedbackKind.Ok, "+" + points + " — Caught it. " + s.it.why, points);
            }
            else
            {
                Score = Mathf.Max(0, Score - HazardPenalty); Streak = 0; Errors++; stepErrors++; stepHazards++; HazardHits++;
                string body = hitId != null ? (s.it.wrongNote ?? s.it.missNote) : s.it.missNote;
                fb = new Feedback(FeedbackKind.Danger, "−" + HazardPenalty + " — " + (hitId != null ? "Wrong response" : "Missed it") + ". " + body, 0, true);
                if (OnHazard != null) OnHazard(s.it.target);
            }
            if (OnInterruptEnd != null) OnInterruptEnd(s.it);
            return Emit(fb);
        }

        // ------------------------------------------------------------ clock

        public void Tick(float dt)
        {
            if (Finished || station == null) return;
            Elapsed += dt;
            TickInterrupts();
            var step = Current;
            if (step == null) return;
            if (step.kind == "drive" && drive != null) { TickDrive(dt); return; }
            if (step.kind == "gauge" && gauge != null && !gauge.committed)
            {
                gauge.t += gauge.dir * gauge.speed * dt;
                if (gauge.t >= 1f) { gauge.t = 1f; gauge.dir = -1f; }
                if (gauge.t <= 0f) { gauge.t = 0f; gauge.dir = 1f; }
            }
            if (step.kind == "track" && track != null)
            {
                var tr = track;
                tr.v += (holding ? tr.rise : -tr.fall) * dt;
                tr.v += Mathf.Sin((Elapsed + tr.wobble) * 1.7f) * tr.drift * dt;
                tr.v = Mathf.Clamp01(tr.v);
                bool inside = tr.v >= tr.lo && tr.v <= tr.hi;
                if (inside) tr.inBand += dt;
                else { if (tr.wasIn) tr.dropouts++; tr.inBand = Mathf.Max(0f, tr.inBand - dt * 0.8f); }
                tr.wasIn = inside;
                if (tr.inBand >= step.seconds)
                {
                    int clean = Mathf.Max(0, 40 - tr.dropouts * 12);
                    Advance(StepPoints + 20 + clean, tr.dropouts == 0 ? "Held it clean the whole way." : null);
                }
                return;
            }
            if (step.kind == "hold" && holding)
            {
                holdFor = Mathf.Min(step.seconds, holdFor + dt);
                if (holdFor >= step.seconds) { holding = false; Advance(StepPoints + 25); }
            }
        }

        void Finish()
        {
            if (Finished) return;
            Finished = true;
            float par = station.parSeconds > 0 ? station.parSeconds : 150f;
            TimeBonus = Mathf.Max(0, Mathf.RoundToInt((par - Elapsed) * 2f));
            Score += TimeBonus;
            if (prepared) { PreparedBonusPoints = Mathf.RoundToInt(Score * PreparedBonus); Score += PreparedBonusPoints; }
            Stars = Errors == 0 && Elapsed <= par ? 3 : Errors <= 1 && Elapsed <= par * 1.5f ? 2 : 1;
            if (OnFinish != null) OnFinish(this);
        }

        /// The record this run writes, in the shape WebXR/shared/records.js stores.
        public TrainingRecord ToRecord(string learner = null)
        {
            var r = new TrainingRecord
            {
                app = station.app, simId = station.id, simName = station.name, category = station.category, trade = station.trade,
                certification = station.certification, system = station.gameSystem, score = Score, stars = Stars, errors = Errors,
                hazardHits = HazardHits, holdBreaks = HoldBreaks, seconds = Mathf.RoundToInt(Elapsed), parSeconds = Mathf.RoundToInt(station.parSeconds),
                learner = learner,
            };
            foreach (var s in StepLog) r.debrief.steps.Add(s);
            r.debrief.totalSteps = station.steps.Count;
            foreach (var s in StepLog) if (s.clean) r.debrief.cleanSteps++;
            if (InterruptLog.Count > 0)
            {
                r.interrupts = new InterruptTally { total = interrupts.Count };
                foreach (var l in InterruptLog)
                {
                    if (l.outcome == "answered") r.interrupts.answered++;
                    else if (l.outcome == "wrong") r.interrupts.wrong++;
                    else r.interrupts.missed++;
                    r.interrupts.log.Add(l);
                }
            }
            r.Seal();
            return r;
        }
    }
}
`;

const TRAINING_RECORD_CS = `// SmartCiti.X content bridge — training records.
//
// The record shape WebXR/shared/records.js writes, so a record from Unity
// round-trips with the web apps' CSV, xAPI 1.0.3 and Open Badges exports and
// the instructor console reads it unchanged. The pass rule is stated once,
// here as in records.js: stars >= 2 and no unsafe action.
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Text;

namespace SmartCitiX
{
    public class InterruptTally
    {
        public int total, answered, wrong, missed;
        public List<InterruptLogEntry> log = new List<InterruptLogEntry>();
    }

    public class Debrief
    {
        public List<StepLogEntry> steps = new List<StepLogEntry>();
        public int totalSteps, cleanSteps;
    }

    public class TrainingRecord
    {
        // records.js CSV_COLUMNS, in order.
        public static readonly string[] CsvColumns =
        {
            "at", "learner", "learnerName", "learnerId", "homePage", "app", "simId", "simName", "category", "trade", "certification", "system",
            "score", "stars", "errors", "hazardHits", "holdBreaks", "seconds", "parSeconds", "passed",
            "badges", "level", "levelName", "id",
        };

        public string id;
        public string at;
        public string learner;
        public string learnerName;
        public string learnerId;
        public string homePage;
        public string app;
        public string simId;
        public string simName;
        public string category;
        public string trade;
        public string certification;
        public string system;
        public int score;
        public int stars;
        public int errors;
        public int hazardHits;
        public int holdBreaks;
        public int seconds;
        public int parSeconds;
        public bool passed;
        public List<string> badges = new List<string>();
        public int level;
        public string levelName;
        public Debrief debrief = new Debrief();
        public InterruptTally interrupts;

        /// The pass rule: two or more stars and no unsafe action.
        public static bool Passed(int stars, int hazardHits) { return stars >= 2 && hazardHits == 0; }

        /// Give the record its id, timestamp and verdict, as records.js's record() does on append.
        public void Seal()
        {
            if (string.IsNullOrEmpty(id)) id = ToBase36(DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()) + "-" + Guid.NewGuid().ToString("N").Substring(0, 6);
            if (string.IsNullOrEmpty(at)) at = DateTime.UtcNow.ToString("yyyy-MM-dd'T'HH:mm:ss.fff'Z'", CultureInfo.InvariantCulture);
            passed = Passed(stars, hazardHits);
        }

        static string ToBase36(long v)
        {
            const string digits = "0123456789abcdefghijklmnopqrstuvwxyz";
            if (v == 0) return "0";
            var sb = new StringBuilder();
            while (v > 0) { sb.Insert(0, digits[(int)(v % 36)]); v /= 36; }
            return sb.ToString();
        }

        /// ISO 8601 duration from whole seconds, e.g. 125 -> PT2M5S.
        public static string IsoDuration(int seconds)
        {
            int s = Math.Max(0, seconds), h = s / 3600, m = (s % 3600) / 60, sec = s % 60;
            var sb = new StringBuilder("PT");
            if (h > 0) sb.Append(h).Append('H');
            if (m > 0) sb.Append(m).Append('M');
            if (sec > 0 || (h == 0 && m == 0)) sb.Append(sec).Append('S');
            return sb.ToString();
        }

        /// The record as the JSON object records.js stores in its list.
        public Dictionary<string, object> ToJsonObject()
        {
            var d = new Dictionary<string, object>
            {
                { "id", id }, { "at", at }, { "learner", learner }, { "learnerName", learnerName }, { "learnerId", learnerId }, { "homePage", homePage },
                { "app", app }, { "simId", simId }, { "simName", simName }, { "category", category }, { "trade", trade }, { "certification", certification }, { "system", system },
                { "score", (double)score }, { "stars", (double)stars }, { "errors", (double)errors }, { "hazardHits", (double)hazardHits }, { "holdBreaks", (double)holdBreaks },
                { "seconds", (double)seconds }, { "parSeconds", (double)parSeconds }, { "passed", passed }, { "badges", new List<object>(badges.ToArray()) },
                { "level", (double)level }, { "levelName", levelName },
            };
            var steps = new List<object>();
            foreach (var s in debrief.steps)
                steps.Add(new Dictionary<string, object> { { "id", s.id }, { "title", s.title }, { "kind", s.kind }, { "seconds", (double)s.seconds }, { "corrections", (double)s.corrections }, { "hazards", (double)s.hazards }, { "clean", s.clean }, { "points", (double)s.points } });
            d["debrief"] = new Dictionary<string, object> { { "steps", steps }, { "totalSteps", (double)debrief.totalSteps }, { "cleanSteps", (double)debrief.cleanSteps } };
            if (interrupts != null)
            {
                var log = new List<object>();
                foreach (var l in interrupts.log) log.Add(new Dictionary<string, object> { { "id", l.id }, { "outcome", l.outcome }, { "seconds", (double)l.seconds } });
                d["interrupts"] = new Dictionary<string, object> { { "total", (double)interrupts.total }, { "answered", (double)interrupts.answered }, { "wrong", (double)interrupts.wrong }, { "missed", (double)interrupts.missed }, { "log", log } };
            }
            else d["interrupts"] = null;
            return d;
        }

        public string ToJson() { return MiniJson.Write(ToJsonObject()); }

        /// Read a record the web apps stored (records.js) or this class wrote.
        public static TrainingRecord FromJson(string json)
        {
            var d = MiniJson.Parse(json) as Dictionary<string, object>;
            if (d == null) throw new FormatException("record did not parse");
            var r = new TrainingRecord
            {
                id = MiniJson.Str(d, "id"), at = MiniJson.Str(d, "at"), learner = MiniJson.Str(d, "learner"), learnerName = MiniJson.Str(d, "learnerName"),
                learnerId = MiniJson.Str(d, "learnerId"), homePage = MiniJson.Str(d, "homePage"), app = MiniJson.Str(d, "app"), simId = MiniJson.Str(d, "simId"),
                simName = MiniJson.Str(d, "simName"), category = MiniJson.Str(d, "category"), trade = MiniJson.Str(d, "trade"), certification = MiniJson.Str(d, "certification"),
                system = MiniJson.Str(d, "system"), score = (int)MiniJson.Num(d, "score", 0), stars = (int)MiniJson.Num(d, "stars", 0), errors = (int)MiniJson.Num(d, "errors", 0),
                hazardHits = (int)MiniJson.Num(d, "hazardHits", 0), holdBreaks = (int)MiniJson.Num(d, "holdBreaks", 0), seconds = (int)MiniJson.Num(d, "seconds", 0),
                parSeconds = (int)MiniJson.Num(d, "parSeconds", 0), level = (int)MiniJson.Num(d, "level", 0), levelName = MiniJson.Str(d, "levelName"),
            };
            foreach (var b in MiniJson.List(d, "badges")) if (b is string) r.badges.Add((string)b);
            r.passed = Passed(r.stars, r.hazardHits);
            return r;
        }

        /// One RFC 4180 CSV row in CsvColumns order (records.js toCSV).
        public string ToCsvRow()
        {
            var cells = new List<string>();
            foreach (var c in CsvColumns) cells.Add(CsvCell(Field(c)));
            return string.Join(",", cells.ToArray());
        }

        public static string CsvHeader() { return string.Join(",", CsvColumns); }

        object Field(string name)
        {
            switch (name)
            {
                case "at": return at; case "learner": return learner; case "learnerName": return learnerName; case "learnerId": return learnerId;
                case "homePage": return homePage; case "app": return app; case "simId": return simId; case "simName": return simName;
                case "category": return category; case "trade": return trade; case "certification": return certification; case "system": return system;
                case "score": return score; case "stars": return stars; case "errors": return errors; case "hazardHits": return hazardHits;
                case "holdBreaks": return holdBreaks; case "seconds": return seconds; case "parSeconds": return parSeconds; case "passed": return passed;
                case "badges": return string.Join("; ", badges.ToArray()); case "level": return level; case "levelName": return levelName; case "id": return id;
                default: return null;
            }
        }

        static string CsvCell(object v)
        {
            if (v == null) return "";
            string s = v is bool ? ((bool)v ? "true" : "false") : Convert.ToString(v, CultureInfo.InvariantCulture);
            return s.IndexOfAny(new[] { '"', ',', '\\n', '\\r' }) >= 0 ? "\\"" + s.Replace("\\"", "\\"\\"") + "\\"" : s;
        }

        /// One xAPI 1.0.3 statement, as records.js toXAPI builds it.
        public Dictionary<string, object> ToXapiStatement(string actorName = "YOU", string homePageDefault = "https://smartciti.example")
        {
            string home = homePage ?? homePageDefault;
            string who = learnerId ?? learner ?? actorName;
            Func<string, string> ext = k => homePageDefault + "/xapi/ext/" + k;
            var result = new Dictionary<string, object>
            {
                { "score", new Dictionary<string, object> { { "raw", (double)score }, { "min", 0.0 } } },
                { "success", passed }, { "completion", true }, { "duration", IsoDuration(seconds) },
                { "extensions", new Dictionary<string, object>
                    {
                        { ext("stars"), (double)stars }, { ext("corrections"), (double)errors }, { ext("unsafe-actions"), (double)hazardHits }, { ext("hold-breaks"), (double)holdBreaks },
                        { ext("par-seconds"), (double)parSeconds }, { ext("badges"), new List<object>(badges.ToArray()) },
                    }
                },
            };
            return new Dictionary<string, object>
            {
                { "id", id }, { "timestamp", at },
                { "actor", new Dictionary<string, object> { { "objectType", "Agent" }, { "name", learnerName ?? learner ?? actorName }, { "account", new Dictionary<string, object> { { "homePage", home }, { "name", who } } } } },
                { "verb", new Dictionary<string, object> { { "id", passed ? "http://adlnet.gov/expapi/verbs/passed" : "http://adlnet.gov/expapi/verbs/failed" }, { "display", new Dictionary<string, object> { { "en-US", passed ? "passed" : "failed" } } } } },
                { "object", new Dictionary<string, object>
                    {
                        { "objectType", "Activity" }, { "id", homePageDefault + "/" + (app ?? "app") + "/" + simId },
                        { "definition", new Dictionary<string, object>
                            {
                                { "name", new Dictionary<string, object> { { "en-US", simName ?? simId } } },
                                { "description", new Dictionary<string, object> { { "en-US", ((trade ?? "") + (certification != null ? " — " + certification : "")).Trim() } } },
                                { "type", "http://adlnet.gov/expapi/activities/simulation" },
                            }
                        },
                    }
                },
                { "result", result },
                { "context", new Dictionary<string, object>
                    {
                        { "platform", "SmartCiti.X ~VR Simulators" },
                        { "extensions", new Dictionary<string, object> { { ext("category"), category }, { ext("certification"), certification }, { ext("system"), system }, { ext("learner-level"), (double)level } } },
                    }
                },
            };
        }
    }
}
`;

const README_MD = ({ version, stations, programmes }) => `# SmartCiti.X Content Bridge (org.agifuturefoundation.smartcitix ${version})

The SmartCiti.X ~Holodeck procedures, exported for a Unity runtime by \`tools/export_unity.mjs\` in the platform repository. The content stays authored in the WebXR modules; this package is generated from them and is never edited by hand.

## What is here

- \`Content/stations/*.json\` — ${stations} procedures: the ordered steps (kind, target, prompt, why), the hazards, the interruptions, the citations, the support line, the scene's hit ids and the equipment builders it places.
- \`Content/programmes/*.json\` — ${programmes} curricula with their ladders, competencies and world anchors.
- \`Content/worlds/*.json\` — the Bay World and Fairway Park layout data (and the underwater world when it exists).
- \`Content/index.json\` — the file list, the nine step kinds and the pass rule.
- \`Runtime/\` — the assembly \`SmartCitiX\`: \`StationCatalog\` (loads the JSON), \`StationRunner\` (a MonoBehaviour state machine over the step kinds with the WebXR engine's scoring), \`TrainingRecord\` (the record shape the web apps write, with CSV and xAPI 1.0.3 output).
- \`Models/*.glb\` — the fleet and equipment builders as glTF binaries, with \`Models/MANIFEST.json\` naming every budget entry with its file or the reason it could not export.

## Import

1. In Unity 2021.3 or later, open **Window → Package Manager → + → Add package from disk…** and pick this folder's \`package.json\`; or copy the folder into your project's \`Packages/\`.
2. Copy \`Content/\` to \`Assets/StreamingAssets/SmartCitiX/\` (or keep it in the package and read it from \`Path.Combine(Application.dataPath, ...)\` in the editor).
3. Load and run:

\`\`\`csharp
var catalog = SmartCitiX.StationCatalog.Load(Path.Combine(Application.streamingAssetsPath, "SmartCitiX"));
var station = catalog.Get("charge-point");
var runner = gameObject.AddComponent<SmartCitiX.StationRunner>();
runner.OnFeedback += f => Debug.Log(f.text);
runner.OnFinish += r => Debug.Log(r.ToRecord().ToJson());
runner.Begin(station);
// Wire your interactables' ids (station.hits) to runner.Select(id); hold/track to SetHolding;
// turn to Rotate; drag to DropAt; drive to DriveInput / DriveCheckDone.
\`\`\`

The models import with Unity's glTF importer of your choice (glTFast or UnityGLTF). They are metres, +Z forward, +X the driver's side, y = 0 the ground; named child nodes are the parts a station animates.

## Pass rule

The same as the web apps: a run passes with **two or more stars and no unsafe action**. Three stars is a clean run inside par; two is at most one correction inside 1.5 × par. Missing or answering wrongly an interruption is an unsafe action.

## Licence

Content and code in this package are released under **CC0 1.0** by the AGI Future Foundation. Only content the platform owns or that is CC0, CC-BY or marketplace-licensed is ever exported: the fleet, equipment and tool models are the platform's own procedural builders. The ready-player avatar and the track GLB are not exported and must be licensed separately. No token, secret or model name is written into this export.
`;
