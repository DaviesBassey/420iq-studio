# 420IQ dry-run recording checklist

Goal: record **one full episode end-to-end** to find real problems (audio,
scene setup, on-camera legibility, pacing) before building anything else. Budget
~30 minutes. You do not need a second person — read the player's answers
yourself; the point is to exercise the whole flow.

## 0. One-time setup

- **Two displays.** Primary = your Host console. Secondary = the Stage (what
  gets captured).
- **Serve the app** over http (service workers need it):
  ```sh
  npm start          # serves on http://localhost:8787
  ```
- **OBS** installed, with one scene ready.
- **Audio:** decide the show-audio source now. The **Host machine** plays the
  SFX/cues; the **Stage window is silent by design**. So capture *desktop audio*
  for the cues, and put your **mic on a separate input** so you can hear it
  isolated. (Mic bleed / a muted background tab is the #1 "unusable recording"
  failure — check it in the first 30 seconds.)

## 1. Launch

1. Primary display: open **`http://localhost:8787/?access=admin#host`**.
   Acknowledge the age gate once.
2. Go to the **Stage** tab → click **Pop out Stage window**.
3. Drag the Stage window to the secondary display → press **F** (or
   double-click) to fullscreen it.
4. Arm audio: click **SFX** in the toolbar until it stops saying **ARM**
   (browsers block audio until a click). You should hear a blip.

## 2. Capture chain (OBS)

- Add a **Window Capture** (or Display Capture of the secondary monitor) →
  point it at the **420IQ Stage** window. Confirm it fills the frame with no
  chrome.
- Add **Desktop Audio** (the cues) and your **Mic** as separate sources so you
  can balance them.
- Do a 10-second test record. **Play it back.** Check: Stage is sharp, cues are
  audible, mic is clean, nothing is clipping. Fix before the real take.

## 3. Full run-through (hit everything once)

Create the session, then walk the flow and tick each item:

- [ ] Intro → Ready → **Go live** (timer starts, ticking audio plays)
- [ ] Select an answer, **Source Signal** lifeline, resolve it
- [ ] Next question → **Trusted Circle** lifeline, resolve it
- [ ] **Lock** an answer → **Reveal** (correct/wrong SFX) → **Knowledge Drop**
      → **Commit score**
- [ ] Deliberately **Undo** one step and redo it — confirm it recovers cleanly
- [ ] Let one timer **run to zero** (hear the expiry cue)
- [ ] Reach the **420 Decision** → pick an IQ target → **Open final**
- [ ] Finish → land on the **recap** (Host + Stage) → read the final IQ on camera
- [ ] **Export audit** (EX) and **download a backup** (BK) when done

## 4. What to watch for (the notes that drive the next phase)

- **Legibility on camera:** are the Stage question, answers, chips, and recap
  numbers big enough at your capture resolution? (This is the most likely thing
  to tweak next.)
- **Audio balance:** cues vs mic vs any room noise.
- **Pacing:** does any state feel like it needs an extra beat / hold?
- **Fumbles:** anywhere you reached for a control that wasn't where you expected.

Bring those four notes back and they'll define exactly what to build next —
type scale, a scene preset, pacing holds, or control layout.
