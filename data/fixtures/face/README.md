# Face Fixtures — Proctoring Pro Tests

This folder holds the still images that Chromium feeds to `getUserMedia` as the
"webcam" stream during proctoring tests. The Playwright runner launches Chrome
with `--use-fake-device-for-media-stream --use-file-for-fake-video-capture=<path>`
and the active fixture's `.y4m` file becomes the live camera feed.

## Files

| File              | Used by             | What it represents                                     |
| ----------------- | ------------------- | ------------------------------------------------------ |
| `baseline.jpg`    | TC-1, TC-6          | The student's enrolled face (must match server photo). |
| `mismatch.jpg`    | TC-2                | A clearly different person (face mismatch).            |
| `no-face.jpg`     | TC-5 (no-face leg)  | Empty room / wall (no face detected).                  |
| `multi-face.jpg`  | TC-5 (multi leg)    | Two people in frame (suspicious activity).             |
| `*.y4m`           | Chromium fake media | Auto-generated 1-frame Y4M videos. Git-ignored.        |

## ⚠️ Replace `baseline.jpg` with your real photo

`baseline.jpg` ships as a **synthetic placeholder**. For the face-match flow to
actually match the photo stored on the LMS server, you must:

1. Save **your enrolled face photo** (the same one uploaded to the LMS profile)
   as `baseline.jpg` in this folder.
   - 640x480, JPEG, well-lit, single face centered.
2. Re-run the Y4M generator (see below).

The other three (`mismatch.jpg`, `no-face.jpg`, `multi-face.jpg`) are synthetic
on purpose — they describe scenarios, not specific people, and don't need
replacing.

## Regenerating Y4M files

After replacing or editing any `.jpg` here, run:

```bash
bash data/fixtures/face/generate-y4m.sh
```

Requires `ffmpeg` (`brew install ffmpeg` on macOS, `apt-get install ffmpeg` on Linux).
The script produces a 2-second 30fps Y4M video per source image, suitable for
`--use-file-for-fake-video-capture`.

## How tests pick a fixture

`config/env.config.js` exposes the resolved paths under `config.lms.faceFixtures`.
The custom fixture (`tests/fixture/customfixture.js`) reads `process.env.FACE_FIXTURE`
(set per test via `test.use({ ... })`) and points Chromium at the matching Y4M file.

To run with a real webcam instead, set `USE_REAL_CAMERA=true`.
