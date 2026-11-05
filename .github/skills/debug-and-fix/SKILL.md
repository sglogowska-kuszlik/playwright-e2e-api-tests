---
name: debug-and-fix
description: 'Use when investigating and fixing a bug, failing test, or unexpected behavior in this repository. Guides root-cause analysis, evidence-based experiments, minimal fixes, and when to ask the user for help.'
argument-hint: 'Describe the failure, unexpected behavior, or relevant test'
---

# Debug and Fix

Use this workflow to investigate and fix failures without relying on speculative edits.

## Understand the failure

1. Restate the observed behavior and expected behavior. Identify the smallest reproducible case.
2. Respect the user's stated scope. If they explicitly identify files to use, start with those files and do not inspect unrelated files or the wider directory unless evidence shows it is necessary or they ask.
3. Use the failure evidence the user supplied first. Do not fetch or inspect reports, traces, or error-context files unless they are relevant, current, and needed; repository artifacts may be stale or belong to a different run.
4. Take the user's observations—including screenshots, video, test behavior, and logs—into account when forming hypotheses and choosing what to inspect next. Treat them as useful evidence, verify against relevant artifacts/runtime behavior where possible, and explain discrepancies rather than dismissing the report.
5. Do not assume where or when tests were run. They may have run from a terminal, VS Code extension, another environment, or CI. If the run context affects diagnosis and is unknown, ask the user before relying on local state or artifacts.
6. Read only the relevant implementation, tests, configuration, and repository guidance needed to investigate the reported issue.
7. Separate the primary failure from follow-on errors. For example, a cleanup failure after setup fails may be secondary.
8. Check existing patterns or recent changes only when they are relevant to the hypothesis. Do not run `git status` or other broad repository checks without a task-specific reason.

## Investigate systematically

1. Form a specific hypothesis from evidence before each experiment.
2. Prefer focused, reversible checks that can confirm or reject that hypothesis: inspect a locator, assertion, response, runtime state, or relevant configuration.
3. Change one causal factor at a time. Avoid changing selectors, timing, configuration, and test expectations together.
4. Do not treat retries, debug-mode success, force actions, or longer timeouts as a root-cause fix. Use them only when they help collect evidence; explain what they establish.
5. Avoid speculative fallbacks, broad catches, silent success paths, and weakened assertions that make the failure disappear without validating intended behavior.
6. Preserve user changes. Before editing a file that may have changed during investigation, reread that file and integrate its current contents.
7. Stay anchored to the user's reported failure. Do not repeatedly cycle through speculative fixes or add unrelated checks. If evidence does not explain the behavior, ask for the specific missing detail before changing direction.
8. Avoid unnecessary actions and broad exploration. Each tool call should answer a concrete question relevant to the failure or requested change.
9. If code changes are made only to investigate a hypothesis (for example, temporary logging, an assertion, a wait, or a pause), tell the user clearly that the change is diagnostic and not the final fix. Keep diagnostic changes minimal and remove or replace them once the hypothesis is confirmed or rejected.
10. Avoid dirty hacks: do not add unnecessary waits, brittle selectors, fallback branches, or unrelated conditionals. Every code change should address the evidenced root cause or be explicitly identified as a temporary diagnostic step.

## Fix and verify

1. Fix the underlying cause with the smallest complete change. Update directly related tests or documentation when needed.
2. Verify the exact behavior that failed using the smallest relevant test or check.
3. If a shared component or Page Object changes, identify and run all tests that use it, subject to user approval for shell commands.
4. Inspect the result, including teardown and side effects, rather than relying only on a zero exit code.
5. Report what caused the issue, what changed, and what verification passed or remains blocked.

## Stop and ask for help

After five distinct, evidence-based attempts without identifying the root cause or a reliable fix, stop investigating. Ask the user for guidance and summarize:

- what evidence and files were inspected;
- each distinct hypothesis or approach tried;
- the outcome of each attempt;
- the specific information or decision needed to continue.

Do not count repeated variations of the same speculative change as distinct attempts, and do not continue cycling through guesses after reaching this limit.
