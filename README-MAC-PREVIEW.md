# EDQ Dashboard Preview for macOS

This is an Apple-silicon (`arm64`) trial build for macOS. It includes the EDQ
demo dataset, User Guide corpus, Gemini preview access, and Google Dig DNS
lookups. It needs an internet connection for Gemini, Google Public DNS, and
Google CheckMX.

## Install

1. Open the downloaded DMG.
2. Drag **EDQ Dashboard Preview** to **Applications**.
3. Open it from Applications.

This unsigned preview may show a Gatekeeper warning. Control-click the app,
choose **Open**, then confirm **Open** once. A notarized release will not need
this step.

## Preview limitations

- The DMG is arm64 only and will not run on Intel Macs.
- Gemini and Google Dig require internet access.
- This demo uses the packaged sample data, not live customer data.
- A temporary Gemini preview key is embedded for the trial. Do not treat the
  build as a production distribution; the key will be revoked after the trial.

## Uninstall

Move the app from Applications to Trash. To remove local conversations,
settings, and logs too, delete:

`~/Library/Application Support/edq-dashboard`
