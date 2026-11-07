---
name: proof-before-push
description: Configure an 8-part proof and quiz-lock verification harness on any git repo. Blocks the agent from finishing tasks without empirical test evidence in .claude/evidence/latest.md, blocks git push from the agent, adds brief capture, runs fresh reviewer and decision skeptic subagents, and locks git push to main behind a 5-question code quiz with token unlock. Use when the user wants Claude Code to prove its work before finishing, asks for a quiz before push to main, wants to stop agents from running git push, or asks to set up proof hooks and skeptic review. Not for setting up general coding rules and CI typecheck gates (use portable-harness), auditing existing rules (use harness-audit), or reviewing code diffs directly (use consistent-code-review).
version: 1.0.0
---

# Proof before push

Configure an 8-step verification and quiz-gated safety harness in a git repository. The harness forces the agent to capture the user's intent first, prove its work empirically with test logs, prevent premature or automated pushes, argue against its own unilateral decisions, and require a 5-question quiz pass before anyone can push to `main`.

## Prerequisites

1. Verify git is initialized: `git rev-parse --is-inside-work-tree`.
2. Inspect existing git hooks: check `git config core.hooksPath` and contents of `.git/hooks`. If active non-sample hooks exist, stop and warn the user before proceeding.
3. Check runtime environment: confirm `node` or `python` is available for running hook scripts.

## The 8 Harness Components

Apply each component in order or report what was already configured:

### 1. Upfront Brief Capture (`/brief`)
Install `.claude/skills/brief/SKILL.md` (and `.agents/skills/brief/` if `.agents` exists) with `disable-model-invocation: true`.
- Forces 3 questions before code changes: what done looks like, guess at fix/design, and how to verify.
- Stores answers to `.claude/briefs/<YYYY-MM-DD>-<task-name>.md`.

### 2. Proof Before Finish (Stop Hook)
Add a `Stop` hook to `.claude/settings.json` executing `scripts/proof-check.js`.
- Inspects git working tree and `.claude/evidence/latest.md`.
- Blocks completion if changes are uncommitted/unstaged, or if evidence file is missing, empty, or older than modified code.

### 3. Agent Push Denial (PreToolUse Hook)
Add a `PreToolUse` hook to `.claude/settings.json` on `Bash` executing `scripts/pre-tool-check.js`.
- Intercepts and denies `git push`, `--no-verify`, and `git commit -n`.
- Denies any attempt by the agent to touch `.git/quiz-pass/` or `.githooks/`.

### 4. Fresh Reviewer Subagent
Create `.claude/agents/reviewer.md` with read-only tools (`Read`, `Grep`, `Glob`, `Bash`).
- Reviews newest brief, `git diff origin/main`, and `.claude/evidence/latest.md`.
- Proves what checks did and did not verify, checks mirror-test assumptions, and answers *"Did we miss anything?"* without praise or style commentary.

### 5. Decisions & Skeptic Subagent (`/decisions`)
- Create `.claude/agents/skeptic.md` (model: `sonnet`): Argues counter-position in two sharp sentences.
- Create `.claude/skills/decisions/SKILL.md` (`disable-model-invocation: true`): Enumerates unilateral decisions, prompts skeptic, and persists rejected choices as rules in `CLAUDE.md`.

### 6. Git Push Lock on Main
- Configure `git config core.hooksPath .githooks`.
- Install executable pre-push hook at `.githooks/pre-push`.
- Blocks push targeting `main` unless `.git/quiz-pass/<commit-hash>` exists. Allows branch deletions and non-main branch pushes.

### 7. 5-Question Diff Quiz (`/quiz`)
Install `.claude/skills/quiz/SKILL.md` (`disable-model-invocation: true`).
- Selects 4 random non-blank diff lines + 1 core assumption question.
- On a 5/5 score, outputs terminal unlock command:
  `mkdir -p .git/quiz-pass && touch .git/quiz-pass/$(git rev-parse HEAD)`
- Never allows the agent to execute this command.

### 8. Weekly Practice Audit (`/friday`)
Install `.claude/skills/friday/SKILL.md`.
- Analyzes past 7 days of quiz logs, briefs, and git log to output a single line naming the least-practiced engineering skill.

## Verification & Handoff

- Run `scripts/proof-check.js` with an empty evidence file to demonstrate that completion is blocked.
- Run `scripts/pre-tool-check.js` with dummy `git push origin main` to confirm denial.
- Pipe sample refs into `.githooks/pre-push` to verify exit codes for `main` (no pass = 1, with pass = 0, feature branch = 0).
- Remind the user to restart the agent session so new subagents and settings hooks load cleanly.
