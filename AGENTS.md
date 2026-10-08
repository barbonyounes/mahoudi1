<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture rules

- Teacher workspace: `/teacher` (library) and `/teacher/lesson/$lessonId` (editor, file `teacher_.lesson.$lessonId.tsx` — trailing underscore keeps it out of the library's route nesting) are public, no login. State is one whole-workspace draft (`curriculum` for 3am+4am + `lessons` array) autosaved (0.8s debounce) to localStorage key `svt-teacher-workspace-v1` via `useTeacherWorkspace`. Why: user explicitly rejected email/password gating; edits are per-browser.
- Student pages (`/level/$levelId`, `/lesson/$lessonId`) read the locally saved workspace through `useTeacherView` (localStorage + `teacher-workspace-saved` event); with no saved workspace the original static data renders. Why: teacher customizations are per-browser and must never alter the shipped content.
- Uploaded teacher files are stored as data URLs in the draft (3MB cap) — no Supabase storage, since there is no auth.
- Copyable "original" lessons stay in `src/data/lessons.ts`; teacher copies get fresh ids prefixed `lesson-` and their curriculum session records `originalLessonId` to enable restore.
- `dig-mouth`, `dig-stomach`, `dig-anatomy`, `eq-phenomenon`, and `eq-causes` always retain their dedicated document-led journeys after local teacher edits, with editable stations rendered inside the matching journey stage. Why: custom classroom activities and uploaded documents must not replace the specialized teaching experience.
- Digestive puzzle drawings and assembly bounds share one SVG anatomy registry; use its bounds for trays, placement, and pointer hit testing. Why: organ previews must match their assembled anatomy without independent coordinate drift.
