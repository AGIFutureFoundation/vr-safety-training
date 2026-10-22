// SmartCiti.X content bridge — the station catalog.
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

        static void SkipWs(string s, ref int i) { while (i < s.Length && (s[i] == ' ' || s[i] == '\t' || s[i] == '\n' || s[i] == '\r')) i++; }

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
                if (c != '\\') { sb.Append(c); continue; }
                if (i >= s.Length) break;
                char e = s[i++];
                switch (e)
                {
                    case '"': sb.Append('"'); break;
                    case '\\': sb.Append('\\'); break;
                    case '/': sb.Append('/'); break;
                    case 'b': sb.Append('\b'); break;
                    case 'f': sb.Append('\f'); break;
                    case 'n': sb.Append('\n'); break;
                    case 'r': sb.Append('\r'); break;
                    case 't': sb.Append('\t'); break;
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
                    case '"': sb.Append("\\\""); break;
                    case '\\': sb.Append("\\\\"); break;
                    case '\n': sb.Append("\\n"); break;
                    case '\r': sb.Append("\\r"); break;
                    case '\t': sb.Append("\\t"); break;
                    default:
                        if (c < ' ') sb.Append("\\u").Append(((int)c).ToString("x4"));
                        else sb.Append(c);
                        break;
                }
            }
            sb.Append('"');
        }
    }
}
