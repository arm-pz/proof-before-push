# proof-before-push

> **Make Claude Code prove its work with empirical test logs, challenge its own decisions, and pass a 5-question code quiz before anyone pushes to `main`.**

[![Agent Skills](https://img.shields.io/badge/Agent_Skills-Standard_0.2.0-blue.svg)](https://skillsmith.tech)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

An Agent Skill that sets up an 8-component safety and verification harness in any Git repository. It stops the agent from calling a task "done" without saving raw test output, blocks the agent from ever running `git push`, runs fresh reviewer and skeptic subagents, and locks Git pushes to `main` until the developer passes a 5-question diff quiz.

---

## Quick Install

Install directly into your agent environment using the Skillsmith / Agent Skills CLI:

```bash
npx skills add arm-pz/proof-before-push
```

Or clone into your local or workspace skills root:

```bash
git clone https://github.com/arm-pz/proof-before-push.git ~/.gemini/skills/proof-before-push
```

---

## What the Harness Installs

When triggered (e.g. *"Set up the proof and quiz lock harness on this repo"*), this skill installs 8 coordinated components:

```
Your Repository
├── .claude/
│   ├── settings.json            # Stop hook (proof check) & PreToolUse hook (push block)
│   ├── briefs/                  # Timestamped user task briefs (/brief)
│   ├── evidence/latest.md       # Raw test runs & proof required before finishing
│   ├── agents/
│   │   ├── reviewer.md          # Independent read-only code & evidence reviewer
│   │   └── skeptic.md           # Challenges unilateral decisions in 2 sentences
│   ├── skills/
│   │   ├── brief/               # Upfront task scoping
│   │   ├── decisions/           # Audits decisions; persists rejected ones to CLAUDE.md
│   │   ├── quiz/                # 5-question diff quiz; prints token unlock command
│   │   └── friday/              # Weekly practice audit
│   └── hooks/
│       ├── proof-check.js       # Stop hook engine
│       └── pre-tool-check.js    # PreToolUse guardrail engine
└── .githooks/
    └── pre-push                 # Git hook blocking pushes to main without quiz token
```

---

## The 8 Components

1. **Write the brief first (`/brief`)**  
   Forces upfront clarity by asking 3 questions before any code is drafted: what done looks like, your guess at the fix or design, and how you will know if it worked.

2. **Proof before finish (`Stop` hook)**  
   Prevents the agent from ending the session if git has uncommitted changes or if `.claude/evidence/latest.md` is missing, empty, or older than modified code.

3. **No push from the agent (`PreToolUse` hook)**  
   Intercepts tool calls and denies `git push`, `--no-verify`, or `git commit -n`. Pushes must be performed by the developer.

4. **Fresh reviewer subagent (`reviewer`)**  
   A read-only agent that inspects the brief, the diff against `main`, and the evidence file to answer: *"Did we miss anything?"* without empty praise or style comments.

5. **Decisions you didn't make (`/decisions` & `skeptic`)**  
   Enumerates every implicit default or deferred requirement. The skeptic argues the counter-position in two sentences. Any rejected decision is permanently recorded in `CLAUDE.md` as a repo rule.

6. **Lock on main (Git `pre-push` hook)**  
   Git refuses pushes targeting `main` unless a pass token exists at `.git/quiz-pass/<commit-hash>`. Passes sit inside `.git`, so they are never committed.

7. **The 5-question quiz (`/quiz`)**  
   Selects 4 random non-blank lines from the diff and 1 core assumption question. Only upon scoring **5 out of 5** does it display the unlock command for you to run in your own terminal. The agent itself is blocked from touching `.git/quiz-pass/`.

8. **The Friday check (`/friday`)**  
   Audits the past 7 days of quiz logs, briefs, and git commit history to report the single skill or engineering discipline you've practiced least.

---

## Verification

To verify that the harness is active:

1. **Test proof requirement:**
   ```bash
   node .claude/hooks/proof-check.js
   # Returns code 1 if evidence/latest.md is empty or missing
   ```
2. **Test push refusal:**
   ```bash
   node .claude/hooks/pre-tool-check.js "git push origin main"
   # Returns: "Claude cannot run git push or skip git hooks. You run this command yourself."
   ```
3. **Test pre-push git lock:**
   ```bash
   echo "refs/heads/main HEAD refs/heads/main 0000000000000000000000000000000000000000" | sh .githooks/pre-push
   # Returns: "Push to main blocked: commit ... has not passed the quiz. Run /quiz to unlock."
   ```

---

## License

[MIT](LICENSE) © 2026 Abdul Rahman P Z
