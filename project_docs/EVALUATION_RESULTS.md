# Evaluation Results

Updated: 2026-11-23

## Automated rule and validation checks

The initial unit suite covers URL structure, non-web schemes, payment/message signals, inconclusive handling, model-output validation, and cloud-consent routing. See `2026-11-23_MVP_TEST_RESULTS.md` for the actual count and output.

## Measurements not yet available

- Precision, recall, false-positive rate, and false-negative rate: not measured. No labeled dataset was used.
- Local/cloud latency and fallback success: not measured. No live model inference has completed.
- Offline behavior on supported hardware: not measured.
- Product outcome claims: none made.

## Manual browser observation

The local browser reported Chrome Prompt API availability as `downloadable`, not `available`. The local Firebase configuration lacks an App Check site key, so a LinkGuard run displayed deterministic findings and the expected setup error for AI; no Firebase request was made. This is an observed configuration block, not a live AI test.
