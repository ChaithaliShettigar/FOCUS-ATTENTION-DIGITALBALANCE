# FocusUp (frontend)

React + Vite + Tailwind v3 single-page app for FocusUp — a playful yet professional study companion with timers, focus tracking, tab-switch reminders, mini-breaks, groups, analytics, and an internal-only AI HelpBot. All data starts empty; you add your own PDFs, YouTube links, and coding cards.

## Run locally
```bash
npm install
npm run dev
```
Open the URL shown by Vite.

## Build
```bash
npm run build
npm run preview
```

## Notes
- Zero seed data: no demo users or content. Use the Learn page to upload PDFs / add YouTube links / add coding study cards.
- Focus sessions always start with a target timer; activity tracking watches scroll/mouse/touch/typing plus tab switches and idle time.
- Landing page is parallax animated; all other pages use a soft beige WhatsApp-like doodle background with education icons.
- AI HelpBot only searches inside FocusUp items; if nothing matches, it politely says so. Voice replies are optional.
- On the 3rd tab switch during a session, a mini-break modal pops up with a quick quiz/joke to re-engage.
