# SmartExam AI — MVP

This package is a browser-based MVP designed for a hackathon demo.

## What it demonstrates
- Camera or uploaded exam video input
- Start/stop exam monitoring
- Interactive suspicious-behavior event simulation
- Seat/candidate association
- Event queue with risk levels and timestamps
- Structured incident summary generation
- Human reviewer decisions: dismiss / no violation / escalate
- Export of incident data as JSON

## Important limitation
This offline MVP demonstrates the workflow. It does **not** contain a trained computer-vision cheating-detection model, and its incident summary is generated deterministically from event metadata.

## How to run locally
Open `index.html` in a modern browser.
For camera access, some browsers require HTTPS or localhost.

## Fast public deployment
Option A — Netlify Drop:
1. Unzip the package.
2. Drag the entire `SmartExam_AI_MVP` folder into Netlify Drop.
3. Copy the generated HTTPS link.

Option B — GitHub Pages:
1. Create a repository.
2. Upload all files from this folder.
3. Enable Pages from the main branch.
4. Use the published HTTPS link in the hackathon form.

## Suggested form label
SmartExam AI — Interactive MVP

## Recommended demo sequence
1. Open the public link.
2. Click Start Monitoring.
3. Click “Possible unauthorized object”.
4. Generate Summary.
5. Select a human review outcome.
6. Explain that the final decision always remains with authorized examination staff.
