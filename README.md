# FormCheck — AI Exercise Form Checker

Real-time exercise form analysis using your device camera and AI pose estimation. Currently supports **Squat** analysis with live feedback on depth, knee valgus, and lateral trunk shift.

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

Copy `.env.example` to `.env.local` and add your OpenAI API key:

```bash
cp .env.example .env.local
```

The OpenAI key powers the AI coaching feedback on the Workout Summary page. The app works without it — you'll just see a fallback message instead of personalized advice.

## Project Structure

```
src/
  app/                    # Next.js App Router pages
    api/feedback/         # OpenAI proxy route
    analysis/             # Live camera analysis screen
    exercises/            # Exercise grid + detail pages
    summary/              # Post-workout summary
    profile/              # User profile + unlock codes
    dashboard/            # Physio dashboard (placeholder)
  components/             # Reusable UI components
    CameraView.tsx        # Camera + pose overlay (client-only)
    MobileShell.tsx       # 9:16 app container
  hooks/                  # Custom React hooks
    useCamera.ts          # Camera stream lifecycle
    usePoseDetection.ts   # MediaPipe frame loop
    useSquatAnalysis.ts   # Orchestrates calibration + analysis
  lib/
    mediapipe.ts          # PoseLandmarker initialization
    squat/
      constants.ts        # Tunable thresholds
      formChecks.ts       # Depth, valgus, trunk shift checks
      stateMachine.ts     # Rep counting FSM
      types.ts            # TypeScript types
  context/                # React context providers
```

## How Squat Analysis Works

All analysis is **rule-based geometry** — no ML model training involved. MediaPipe Pose provides 33 body landmarks per frame; downstream logic is threshold comparisons:

1. **Calibration**: User stands still for ~1 second. The app captures baseline hip-to-knee vertical distance and standing joint positions.

2. **Depth detection**: Compares current hip-knee Y delta against the calibrated standing delta. Flags "Go deeper" or "Too low."

3. **Knee valgus**: Compares horizontal distance between knees vs. ankles. If knees collapse inward relative to ankles, flags "Knees caving in."

4. **Lateral trunk shift**: Compares shoulder midpoint X vs. hip midpoint X. Flags asymmetric lean.

5. **Rep counting**: A 4-state machine (STANDING → DESCENDING → BOTTOM → ASCENDING) with hysteresis bands to avoid false counts from noise.

6. **Stop recommendation**: If critical errors (valgus or trunk shift) occur on 2 consecutive reps, warns the user to stop.

All thresholds are in `src/lib/squat/constants.ts` for easy tuning.

## Tech Stack

- **Next.js** (App Router) + TypeScript + Tailwind CSS
- **MediaPipe Tasks Vision** for client-side pose detection
- **OpenAI API** (gpt-4o-mini) for post-workout coaching feedback
- No database — session state lives in React context + sessionStorage
