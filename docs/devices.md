# Head-worn devices: how the apps run on each

SmartCiti.X, Trade Skills Simulator and the Holodeck are WebXR pages. They run in three ways: **flat** (any browser, mouse or touch, voice), **immersive AR** (a WebXR browser with hit-test: the station is placed on the real floor) and **immersive VR** (a headset browser). The head-worn devices a site crew or a response team actually wears are mostly assisted-reality or optical see-through systems whose browsers offer no immersive WebXR session, so the apps carry a **device profile layer** (`WebXR/shared/devices.js`) that adapts the flat mode to the display in front of the wearer's eye instead of pretending it is a desktop.

Detection: `?device=<id>` on the URL wins (pin a kiosk or a device fleet that way), then the browser's user agent, then a small-monocular screen heuristic, else desktop. The intro rail names what was detected and how it will run, so a learner can correct it. Add `&profile=` overrides by changing the device id; the profile is never guessed from the procedure.

## The five run profiles

| Profile | Pixel ratio | Shadows | Weather | Skyline | HUD scale | Background | Entry | Voice |
|---|---|---|---|---|---|---|---|---|
| desktop | ≤2 | on | full | built | 1.0 | district sky | flat | optional |
| vr | ≤2 | on | full | built | 1.0 | district sky | VR | optional |
| mr | 1 | off | light (storm, rain, smoke → overcast) | not built | 1.15 | real room | AR | prompted |
| seethrough | 1 | off | off | not built | 1.3 | **black** (transparent to the wearer) | flat | prompted |
| assisted | 1 | off | off | not built | 1.5 | flat dark | flat | prompted |

On a monocular hardhat display the learner sees one large step card at a time; voice commands ("next", "hint", "brief", "status", the step's own words) run the procedure, and drag steps can be completed by naming the target. On optical see-through glasses the scene is drawn on black so the real site shows through the display; the HUD uses the high-contrast theme.

<table><tr>
<td width="50%"><img src="screenshots/devices/trench-box_seethrough_epson-bt-45cs.png" width="100%" alt="Trench Box under the see-through profile: the station on black with no horizon"><br><b>See-through profile</b> (<code>?device=epson-bt-45cs</code>): the station on black, no skyline or weather, HUD at 1.3×.</td>
<td width="50%"><img src="screenshots/devices/trench-box_assisted_realwear-navigator-520.png" width="100%" alt="Trench Box under the assisted-reality profile: flat dark scene with a large HUD"><br><b>Assisted profile</b> (<code>?device=realwear-navigator-520</code>): flat dark scene, HUD at 1.5×, voice prompted.</td>
</tr></table>

## The fifteen devices reviewed

| Device | Kind | Profile | WebXR | How it runs | Verify before procurement |
|---|---|---|---|---|---|
| RealWear Navigator 520 / 500 | assisted reality, monocular, voice-first | assisted | none | flat, one card at a time, voice | helmet clip on the approved slot; used with certified eyewear |
| RealWear HMT-1Z1 | assisted reality, intrinsically safe | assisted | none | as above | Zone 1 / C1D1 certificate against the site's classification |
| Vuzix M400 | monocular smart glasses | assisted | none | flat, voice and touchpad | M-Series helmet mount on the helmet's accessory slot |
| Vuzix M4000 | monocular waveguide | assisted | none | as above | M-Series mount; brightness outdoors |
| Vuzix Blade 2 | see-through smart glasses | seethrough | none | flat on black | Z87.1 rating of the frame configuration bought |
| Epson Moverio BT-45CS | binocular see-through, headband and helmet options | seethrough | none | flat on black, controller or voice | Z87.1-compatible shields fitted; flip-up display |
| Epson Moverio BT-45C | binocular see-through, rugged | seethrough | none | as above | helmet mount; shields |
| Rokid X-Craft | binocular see-through, helmet-first | seethrough | none | flat on black, voice | IP66 and ATEX/IECEx certificate for the zone |
| Iristick.G2 | safety-glasses form, monocular display | assisted | none | flat, voice, phone tether | rating of the frame; face-shield compatibility |
| ThirdEye X2 MR | binocular MR glasses | seethrough | none | flat on black, voice and gesture | eye-protection rating; decontamination |
| ThirdEye MIDAS | display in a protective mask | seethrough | none | flat on black, voice | the mask's own certification governs |
| Univet VisionAR | AR safety glasses | seethrough | none | flat on black, phone tether | EN166 and Z87.1+ per vendor; helmet compatibility |
| Microsoft HoloLens 2 Industrial Edition | mixed-reality headset | mr | ar | immersive AR in Edge with hit-test and hands | hardhat adapter; the headset is not PPE |
| XYZ Reality Atom | AR in a certified hardhat | mr | none | no general browser: the apps run beside it on a tablet; the Atom carries the BIM overlay | vendor platform integration |
| DAQRI Smart Helmet | integrated AR hardhat (legacy) | mr | none | reference only | current sourcing and support |
| Meta Quest 2 / 3 / Pro | VR with passthrough | vr | both | immersive VR or passthrough AR in the training room | not PPE |

WebXR column: what the device's browser is known to offer today; "none" means the flat mode with the profile's theme. Vendors update browsers, so re-test before a fleet rollout with `node tools/check_devices.mjs` and a visit to each app with `?device=<id>`.

## Three questions the safety officer answers, not the app

1. **Eye protection.** Is the eyewear itself ANSI/ISEA Z87.1+ or EN166 rated, or designed to accept certified shields? Univet states Z87.1+ and EN166; Epson states compatible shields attach. A smart glass is not automatically safety eyewear.
2. **Head protection.** Does the mount attach through the helmet's approved accessory slot or a manufacturer-approved adapter without voiding the helmet's certification? Vuzix's M-Series mounts are made for standard accessory slots; RealWear clips to standard helmets.
3. **Operational suitability.** IP rating, heat and cold, battery runtime, voice control in high noise, decontamination, intrinsic-safety requirements, and whether the display flips out of the field of view.

## A pilot short list

For a hardhat pilot: Epson Moverio BT-45CS (binocular see-through, training and remote assistance), RealWear Navigator 520 (rugged voice-first procedures), Vuzix M400 with the M-Series helmet mount (compact monocular inspection), Rokid X-Craft (hazardous and helmet-first sites), ThirdEye X2 or MIDAS (EMS, public safety and protective-mask use). For construction BIM with immersive trade training, pair the XYZ Reality Atom on site with the Epson BT-45CS or HoloLens 2 Industrial Edition for the training and guided-assembly content. Quest headsets remain the training-room VR device.

## Testing a device

```
node tools/check_devices.mjs                      # the registry and detector
open WebXR/smartcity/index.html?device=vuzix-m400  # the assisted profile on any screen
open WebXR/smartcity/index.html?device=epson-bt-45cs&sim=trench-box   # see-through on black
```
