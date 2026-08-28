# orpheus-gs-wa-components

Web Audio API components for the Orpheus DAW — oscillators, synth, mixer, effects, schedulers, MIDI, and more.

Fork of [creativeplatform/orpheus-gs-wa-components](https://github.com/creativeplatform/orpheus-gs-wa-components), originally from GridSound.

## Dependencies

Clone these repos as siblings under the same parent directory:

```
Developer/
├── orpheus-gs-utils/        ← creativeplatform/orpheus-gs-utils
├── orpheus-daw-core/        ← DAWCore controllers (included in this workspace)
└── orpheus-gs-wa-components/  ← this repo
```

| Dependency | Purpose |
|------------|---------|
| [orpheus-gs-utils](https://github.com/creativeplatform/orpheus-gs-utils) | `GSU*` helpers, data models |
| orpheus-daw-core | `DAWCoreControllerMixer`, `DAWCoreControllerEffects`, `DAWCoreControllerDrumrows` |

## Script load order

```html
<!-- 1. orpheus-gs-utils -->
<script src="../orpheus-gs-utils/gs-utils.js"></script>
<script src="../orpheus-gs-utils/gs-utils-json.js"></script>
<script src="../orpheus-gs-utils/gs-utils-audio.js"></script>
<script src="../orpheus-gs-utils/gs-utils-fft.js"></script>
<script src="../orpheus-gs-utils/gs-utils-models.js"></script>

<!-- 2. orpheus-daw-core (mixer, effects, drumrows only) -->
<script src="../orpheus-daw-core/DAWCoreControllerBase.js"></script>
<script src="../orpheus-daw-core/DAWCoreControllerMixer.js"></script>
<script src="../orpheus-daw-core/DAWCoreControllerEffects.js"></script>
<script src="../orpheus-daw-core/DAWCoreControllerDrumrows.js"></script>

<!-- 3. gswa modules (dependency order matters) -->
<script src="gswaStereoPanner/gswaStereoPanner.js"></script>
<script src="gswaMixer/gswaMixer.js"></script>
<!-- ... see demo/index.html for full list -->
```

## Integration pattern

1. Create an `AudioContext`
2. Load scripts (gs-utils → daw-core → gswa modules)
3. Call `$setContext(ctx)` on each component
4. Wire `GSUnoop` callbacks on schedulers and drumrows
5. Push data patches via `$change(obj)`
6. For wavetables: `await gswaCrossfade.$loadModule(ctx)` before creating crossfade nodes

## Modules

| Module | Description |
|--------|-------------|
| `gswaScheduler` | Timeline engine — BPM, loops, block scheduling |
| `gswaSynth` | Polyphonic synthesizer |
| `gswaOscillator` | Oscillator with wavetable support |
| `gswaPeriodicWaves` | Custom periodic waves and wavetables |
| `gswaCrossfade` | AudioWorklet wavetable morphing |
| `gswaMixer` | Multi-channel mixer with VU meters |
| `gswaEffects` + `gswaFx*` | FX chain (delay, filter, reverb, waveshaper) |
| `gswaPluginHost` | Desktop VST3 insert — IPC bridge via AudioWorklet |
| `gswaPluginMIDIRouter` | Route Web MIDI / note events into loaded VST plugins |
| `gswaPlugins` | Plugin chain controller (pairs with `DAWCoreControllerPlugins`) |
| `gswaDrumrows` | Sample-based drum playback |
| `gswaKeysScheduler` / `gswaDrumsScheduler` | Scheduler bridges |
| `gswaMIDIParser` / `gswaMIDIToKeys` | MIDI file import |
| `gswaMIDIDevices` | Web MIDI input/output |
| `gswaEncodeWAV` | AudioBuffer → WAV export |
| `gswaBPMTap`, `gswaReverbIR`, `gswaSlicer`, etc. | Utilities |

## Demos

| Path | Description |
|------|-------------|
| [demo/index.html](demo/index.html) | Smoke tests — mixer, synth, wavetable, MIDI |
| [gswaMIDIParser/index.html](gswaMIDIParser/index.html) | MIDI parser demo |
| [gswaCrossfade/test.html](gswaCrossfade/test.html) | Wavetable / crossfade integration test |

Serve the repo root with any static file server, then open e.g. `http://localhost:8080/demo/`.

## Desktop plugin hosting

Native VST3/AU/AAX plugins require **[orpheus-desktop](../orpheus-desktop)** (Electron). Browser modules here stay unchanged; `gswaPluginHost` bridges audio to the main-process VST3 host via IPC.

```
Developer/
├── orpheus-desktop/           ← Electron app + plugbridge-electron
├── orpheus-gs-ui-components/  ← gsuiPluginBrowser, gsuiPluginSlot
└── orpheus-gs-wa-components/  ← gswaPluginHost, gswaPlugins (this repo)
```

## License

AGPL-3.0
