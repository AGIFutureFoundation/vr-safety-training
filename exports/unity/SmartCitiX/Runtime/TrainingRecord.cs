// SmartCiti.X content bridge — training records.
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
            return s.IndexOfAny(new[] { '"', ',', '\n', '\r' }) >= 0 ? "\"" + s.Replace("\"", "\"\"") + "\"" : s;
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
