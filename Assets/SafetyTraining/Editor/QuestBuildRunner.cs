using System;
using System.IO;
using UnityEditor;
using UnityEditor.Build.Reporting;

namespace SafetyTraining.Editor
{
    public static class QuestBuildRunner
    {
        const string ScenePath = "Assets/SafetyTraining/Scenes/SafetyTrainingExplorer.unity";

        [MenuItem("Safety Training/Configure Meta Quest (Android)")]
        public static void Configure()
        {
            if (!OpenXrProjectConfigurator.ConfigureQuestAndroid())
                throw new InvalidOperationException("OpenXR Android configuration failed.");
            UnityEngine.Debug.Log("Meta Quest Android OpenXR configuration applied.");
        }

        [MenuItem("Safety Training/Build Meta Quest APK")]
        public static void BuildQuest()
        {
            if (!BuildPipeline.IsBuildTargetSupported(BuildTargetGroup.Android, BuildTarget.Android))
                throw new InvalidOperationException(
                    "Android build support is not installed for this editor. " +
                    "Add the Android Build Support module (with SDK/NDK/OpenJDK) via Unity Hub.");
            if (!OpenXrProjectConfigurator.ConfigureQuestAndroid())
                throw new InvalidOperationException("OpenXR Android configuration failed.");

            var outputDirectory = Path.GetFullPath(Path.Combine("Builds", "Quest"));
            Directory.CreateDirectory(outputDirectory);
            var outputPath = Path.Combine(outputDirectory, "VR-Safety-Training.apk");

            var report = BuildPipeline.BuildPlayer(new BuildPlayerOptions
            {
                scenes = new[] { ScenePath },
                locationPathName = outputPath,
                target = BuildTarget.Android,
                targetGroup = BuildTargetGroup.Android,
                options = BuildOptions.None
            });

            if (report.summary.result != BuildResult.Succeeded)
                throw new InvalidOperationException(
                    $"Quest build failed: {report.summary.result}, errors={report.summary.totalErrors}");

            UnityEngine.Debug.Log(
                $"Quest build succeeded: {outputPath} ({report.summary.totalSize} bytes). " +
                "Install with: adb install -r Builds/Quest/VR-Safety-Training.apk");
        }
    }
}
