# CliPr: clinical prediction models, development and validation

CliPr is a self-contained learning course built on Steyerberg, *Clinical Prediction Models* (2009), chapters 1 to 19. Modules, simulators, quizzes, case tasks with answers at the end, and downloadable synthetic datasets. All data are synthetic. For teaching; not for clinical use.

Live site: https://ramthiru83.github.io/prediction-models-course/

## Use without an account
Open the site. Progress is kept in the browser only.

## Accounts and roles
Sign in or join with a code on the Account page. Learners get synced progress, notes, highlights and editable task answers. Instructors additionally get:

- Class dashboard: roster, concept mastery grid, hardest questions, CSV export, learner detail with written feedback, password reset.
- Inline editing of course text (publishes to all learners), with revert.
- Release control: hide a module or set an open date.
- Join-code and WhatsApp contact setup.

The join code for the first cohort is PMC-2026. Accounts and roles are shared with the EpiCompass project (same Supabase project, `profiles`, `cohorts`, `is_instructor()`); this course adds `pmc_` tables, in `pmc_schema.sql`.

## Repository layout
- `index.html`: the published page (GitHub Pages serves this file).
- `src/` and `content/`: the source. `node build.js --site` rebuilds `index.html` from them; `node build.js --check` reports whether `index.html` is up to date.
- `supabase/snapshot/`: a daily copy of the in-app text edits and release settings (written by the workflow below).
- `supabase/folded.json`: in-app edits that have already been written into the source.
- `tools/mirror_from_github.py`: copies this repository into a local folder without overwriting local changes.

## Keeping the copies in step
There are four places the course lives: the in-app edits (Supabase), this repository, the published page, and the instructor's local folder.

1. **In-app edits to GitHub.** The workflow `.github/workflows/sync-supabase.yml` runs daily at 06:53 IST (or on demand from the Actions tab). It copies the in-app edits and release settings into `supabase/snapshot/`, lists any edits not yet folded into the source, and warns if `index.html` is not a fresh build.
2. **Folding edits into the source.** An in-app edit stays live on top of the page until it is written into `content/`. Once folded and `index.html` is rebuilt, the edit is recorded in `supabase/folded.json`; the live override then no longer applies, because its text is now the page's own.
3. **GitHub to the local folder.** `tools/mirror_from_github.py` brings new or changed files down. A file changed locally is never overwritten; it is reported as needing upload, or as a conflict if GitHub changed it too.
4. **Local folder to GitHub.** If the local folder holds `sync/github-token.txt` (a fine-grained token for this repository only, with Contents read and write), the same script commits local changes to GitHub in one commit. Only course files on a fixed list (`index.html`, `README.md`, `favicon.svg`, `pmc_schema.sql`, `build.js`, `src/`, `content/`, `tools/`, `supabase/folded.json`) are ever pushed; the `sync/` folder never is. Without a token, upload changed files by hand.

A daily scheduled task on the instructor's computer runs steps 2 to 4 and reports anything that needs a decision.

Learner data (progress, notes, answers) stay in Supabase and are never copied to GitHub.

## Writing level

The course starts at a high-school reading level and becomes more technical module by module.

- Primer and Module 1: aim for grade 8 or below (Flesch-Kincaid) in essentials, "What you need", scenarios and tasks. Short sentences, everyday words, one idea per sentence. Explain each technical term in plain words the first time it appears, and show a worked example with counts per 100 before any formula.
- Modules 2 to 7: grade 9 to 10. Terms introduced earlier can be used without re-explaining.
- Modules 8 to 15: grade 10 to 12. Formulas may come first, but each still gets a plain-language reading and a worked example.
- Reference notes may be denser than the cases, but keep the book's content and numbers unchanged at every level.

## Data and privacy
The Supabase publishable key in the page is public by design; row-level security protects data. Learners can read and change only their own rows; instructors can read all learner progress. Learner data are for teaching only. Using them for research needs ethics approval and separate consent.

## Branding
Same BRIC-THSTI palette, type (Instrument Sans and Serif) and layout style as EpiCompass. The mark is a decision curve: the model net-benefit curve above the treat-all line and the treat-none baseline (`favicon.svg`).

## How to use
The in-app page "How to use this course" explains the course path, notes and highlights, and the instructor tools.
