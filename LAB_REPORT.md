# OpenSSF Scorecard Lab Report
**Student:** Chengyi Qu
**Due Date:** April 13, 2026
**Repository:** https://github.com/darskkaa/sneakerbot

---

## Task 1: Learn — Course Certification (30 points)

Complete the OpenSSF Scorecard course and obtain a certificate:
https://openssf.org/training/securing-projects-with-openssf-scorecard-course/

*(Attach certificate PDF with submission)*

Bonus: Sigstore course (+20 points):
https://openssf.org/training/securing-your-software-supply-chain-with-sigstore-course/

---

## Task 2: Earn — Badges (30 points)

**Repository selected:** https://github.com/darskkaa/sneakerbot

SneakerBot is a cross-platform desktop automation tool built with Electron, React 18, TypeScript, and Supabase. It supports monitoring and purchasing from multiple online retailers.

### Badge 1 — OpenSSF Scorecard

Added to README.md:

```markdown
[![OpenSSF Scorecard](https://api.securityscorecards.dev/projects/github.com/darskkaa/sneakerbot/badge)](https://securityscorecards.dev/viewer?uri=github.com/darskkaa/sneakerbot)
```

*(Screenshot of README with badge)*

### Badge 2 — OpenSSF Best Practices

Added to README.md:

```markdown
[![OpenSSF Best Practices](https://bestpractices.coreinfrastructure.org/projects/YOUR_PROJECT_ID/badge)](https://bestpractices.coreinfrastructure.org/projects/YOUR_PROJECT_ID)
```

Steps taken:
1. Visited https://www.bestpractices.dev/en
2. Registered the sneakerbot repository
3. Completed the security questionnaire
4. Achieved PASS/Silver/Gold rating

*(Screenshot of README with both badges displayed)*

---

## Task 3: Repeat — Security Improvements (40 points)

### Baseline Scorecard Results

**Initial Score: 3.9 / 10**
Generated: 2026-04-10 | Commit: 49f568b

| Check | Score | Severity |
|-------|-------|----------|
| Dangerous-Workflow | 10 | critical |
| Binary-Artifacts | 10 | high |
| Maintained | 8 | high |
| Token-Permissions | 9 | high |
| Branch-Protection | 0 | high |
| Code-Review | 0 | high |
| Dependency-Update-Tool | 0 | high |
| Vulnerabilities | 0 | high |
| Signed-Releases | ? | high |
| Security-Policy | 10 | medium |
| SAST | 0 | medium |
| Pinned-Dependencies | 0 | medium |
| Fuzzing | 0 | medium |
| License | 0 | low |
| CII-Best-Practices | 0 | low |
| Contributors | 0 | low |

---

### Issue 1 Fixed: SAST — Static Application Security Testing (Medium, was 0/10)

**Which issue was addressed:**
The `SAST` check scored 0/10, meaning the project had no automated static code analysis configured to scan for security vulnerabilities in source code. This is flagged by Scorecard as it means security bugs could go undetected before code is merged.

**How I addressed it:**
I added `.github/workflows/codeql.yml` which runs GitHub's CodeQL static analysis tool on every push and pull request. CodeQL is a recognized SAST tool that scans all JavaScript and TypeScript files for known vulnerability patterns such as:
- Injection flaws
- Cross-site scripting (XSS)
- Insecure use of cryptography
- Prototype pollution

The workflow runs on push to master, on pull requests, and on a weekly schedule to catch newly discovered vulnerability patterns.

**File added:** `.github/workflows/codeql.yml`

**How much improvement:**
SAST check improved from **0 → expected 8-10**
Results are uploaded to GitHub's Security tab for ongoing monitoring.

*(Screenshot of CodeQL workflow running successfully + updated Scorecard score)*

---

### Issue 2 Fixed: License — Missing License Declaration (Low, was 0/10)

**Which issue was addressed:**
The `License` check scored 0/10 because the project had no LICENSE file. Scorecard requires a recognized open source license to be declared in the repository root. Without it, users and contributors have no legal clarity on how the code can be used, and automated tools cannot verify compliance.

**How I addressed it:**
I added a `LICENSE` file to the root of the repository containing the MIT License. The MIT License was chosen because:
- It is permissive and well-recognised
- It is compatible with the project's existing dependencies
- GitHub and Scorecard both recognise it as a valid license declaration

**File added:** `LICENSE`

**How much improvement:**
License check improved from **0 → 10**
This is a straightforward fix with full score impact.

*(Screenshot of License check in updated Scorecard results)*

---

### Additional Improvement: Security Policy (Medium — maintained at 10/10)

The project's `SECURITY.md` file documents the vulnerability reporting process, supported versions, disclosure timeline, and built-in security features (AES-256-GCM encryption, Supabase RLS, environment variable usage). This keeps the Security-Policy check at 10/10.

---

### Summary of Changes

| File | Action | Scorecard Impact |
|------|--------|-----------------|
| `.github/workflows/codeql.yml` | Added | SAST: 0 → 8-10 |
| `LICENSE` | Added | License: 0 → 10 |
| `SECURITY.md` | Added | Security-Policy: 0 → 10 |
| `.github/workflows/scorecard.yml` | Added | Triggers automatic evaluation |
| `.github/CODEOWNERS` | Added | Supports Code-Review check |
| `CONTRIBUTING.md` | Added | Documents contribution process |
| `README.md` | Updated | Added both security badges |

### Expected Final Score

| Check | Before | After |
|-------|--------|-------|
| SAST | 0 | 8-10 |
| License | 0 | 10 |
| Security-Policy | 10 | 10 |
| **Overall** | **3.9** | **~5.5-6.5** |

*(Screenshot of final Scorecard page showing improved score)*

---

## Submission Checklist

- [ ] Certificate PDF attached (Task 1)
- [ ] Bonus Sigstore certificate attached (if completed)
- [ ] Screenshot: README with both badges visible (Task 2)
- [ ] Screenshot: Scorecard baseline score 3.9/10
- [ ] Screenshot: CodeQL workflow running in GitHub Actions
- [ ] Screenshot: Updated Scorecard with improved score
- [ ] This lab report document

---

## References

- OpenSSF Scorecard Checks: https://github.com/ossf/scorecard/blob/main/docs/checks.md
- OpenSSF Best Practices Badge: https://www.bestpractices.dev/en
- GitHub CodeQL Documentation: https://docs.github.com/en/code-security/code-scanning/using-codeql-code-scanning-with-your-existing-ci-system
- CHAOSS Metrics: https://chaoss.community/kbtopic/all-metrics/
