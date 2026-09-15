# Emmaus: reading experience upgrade

## What changed

A new React homepage keeps the warm visual character, with an original SVG illustration, clear reading actions, a searchable 66-book canon, testament and collection filters, book descriptions, visible study-guide availability, reading paths, and a personal reading dashboard. It is statically rendered and no longer waits for the state API before displaying the canon.

The reader adds persistent font size, focus mode (Escape to exit), reversible chapter completion, next-chapter navigation, and retry/fallback states. Global search accepts chapter references and verse references such as John 3:16; verse references open the containing chapter. Mobile navigation now collapses into a labelled menu. Keyboard focus, modified link clicks, and a skip link are supported.

Book pages lead directly to reading and the chapter list. Empty study-guide panels are removed for books whose commentary has not yet been written; the UI states what is available. Matthew's completed guide is preserved.

## Reliability and privacy

- Existing local notes, decks, card statuses, and last-opened location retain their storage key.
- Browser state is validated before rendering. Invalid book/chapter values cannot crash the home screen. State loading is deduplicated and cloud requests run in the background with timeouts.
- The public API no longer reads/writes the hardcoded `kiril` row. Optional backups are scoped to signed, HttpOnly browser sessions; the legacy database record is untouched. There is no cross-device identity until authenticated sign-in is added. See README for recovery/migration details.
- Background animation listeners are cleaned up on unmount.

## Validation

- Production build.
- Automated tests for every book's chapter boundaries, passage references, legacy-state compatibility, invalid state, session forgery/owner-row protection, and rendering all 66 book pages.
- Browser verification: desktop and 390px mobile home, filters, no-results/reset, passage navigation, real NLT text, font size, focus mode, saved notes after reload, reading completion after reload, dashboard resume/progress, mobile menu, horizontal overflow.
- Local development has no Supabase or OpenAI credentials. Cloud round trips and the live AI tutor are not verified in this environment.

## Recommended next work

1. Add authenticated accounts, migrate the owner's legacy row privately, and implement conflict-aware cross-device sync. Session-isolated backup is not a substitute for accounts.
2. Expand reviewed book guides next, starting with Mark, Luke, John, and Genesis. Separate generated drafts from reviewed content and track source/provenance. Avoid presenting generated interpretation as reviewed commentary.
3. Replace the remaining HTML-string study views with React components. This makes accessible headings, state, form validation, and navigation easier to maintain.
4. Add a licensed offline text option and note export/import. NLT availability currently depends on an external API and its usage terms; do not promise offline access without a suitable license.
5. Add authenticated tutor quotas and durable rate limiting before broader public use. The tutor endpoint can incur API costs when configured.

## Release

Review the branch and preview before merging. Merging into the deployment branch may publish through the existing Vercel integration. The privacy fix applies to production only after deployment.
