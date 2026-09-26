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

- Teacher workspace: `/teacher` (library) and `/teacher/lesson/$lessonId` (editor) live under `_authenticated`; state is one whole-workspace draft (`curriculum` for 3am+4am + `lessons` array) edited locally and autosaved (1.2s debounce) via `useTeacherWorkspace`. Why: the DB stores the full snapshot per teacher as JSON, so all CRUD operates on one draft object.
- Student pages (`/level/$levelId`, `/lesson/$lessonId`) read the teacher's saved workspace through `useTeacherView` only when signed in; otherwise the original static data renders. Why: teacher customizations are per-account and must never alter public content.
- Copyable "original" lessons stay in `src/data/lessons.ts`; teacher copies get fresh ids prefixed `lesson-` and their curriculum session records `originalLessonId` to enable restore.
