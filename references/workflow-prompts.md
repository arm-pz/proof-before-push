# Workflow 1 Prompts: Proof Before Push & Quiz Lock

Original prompt sequence adapted from Skillsmith:

1. **Write the brief first (`/brief`)**
   Ask what done looks like, what the guess at fix/design is, and how to verify. Save to `.claude/briefs/<date>-<task-name>.md`.

2. **Proof before finish (Stop hook)**
   Blocks finishing if git has uncommitted changes or `.claude/evidence/latest.md` is missing, empty, or stale.

3. **No push from Claude (PreToolUse hook)**
   Denies any `git push`, `--no-verify`, or `git commit -n` command.

4. **Fresh reviewer subagent (`reviewer.md`)**
   Read-only subagent that reviews brief, diff against `main`, and evidence. Answers *"Did we miss anything?"* without praise or style commentary.

5. **Decisions you didn't make (`/decisions` & `skeptic.md`)**
   Lists decisions; skeptic counter-argues in two sentences; rejections appended to `CLAUDE.md`.

6. **Lock on main (pre-push hook)**
   Blocks pushes to `main` unless `.git/quiz-pass/<commit-hash>` exists.

7. **The 5-question quiz (`/quiz`)**
   4 diff questions + 1 assumption question. Outputs token generation command only on 5/5. Agent is blocked by hook from touching token.

8. **The Friday check (`/friday`)**
   Weekly audit of least-practiced skill from quiz logs, briefs, and git commit history.
