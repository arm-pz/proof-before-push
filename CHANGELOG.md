# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-11-07

### Added
- Initial release of `proof-before-push` skill.
- 8-step verification and safety harness:
  - `/brief` upfront intent capture.
  - Stop hook requiring empirical test evidence in `.claude/evidence/latest.md`.
  - PreToolUse guardrails blocking agent `git push`, `--no-verify`, and token manipulation.
  - `reviewer` read-only subagent.
  - `/decisions` skill and `skeptic` subagent for challenging defaults and appending rules to `CLAUDE.md`.
  - Git `pre-push` hook blocking push to `main` without `.git/quiz-pass/<sha>`.
  - `/quiz` 5-question code diff quiz with token generator.
  - `/friday` weekly skill practice audit.
