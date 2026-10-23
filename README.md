# Clinical prediction models: development and validation

A self-contained learning course built on Steyerberg, *Clinical Prediction Models* (2009), chapters 1 to 19. Modules, simulators, quizzes, case tasks with answers at the end, and downloadable synthetic datasets. All data are synthetic. For teaching; not for clinical use.

Live site: https://ramthiru83.github.io/prediction-models-course/

## Use without an account
Open the site. Progress is kept in the browser only.

## Accounts and roles
Sign in or join with a code on the Account page. Learners get synced progress, notes, highlights and editable task answers. Instructors additionally get:

- Class dashboard: roster, concept mastery grid, hardest questions, CSV export, learner detail with written feedback, password reset.
- Inline editing of course text (publishes to all learners), with revert.
- Release control: hide a module or set an open date.
- Join-code and WhatsApp contact setup.

The join code for the first cohort is PMC-2026. Accounts and roles are shared with the EpiCompass project (same Supabase project, `profiles`, `cohorts`, `is_instructor()`); this course adds `pmc_` tables, in `supabase/pmc_schema.sql`.

## Data and privacy
The Supabase publishable key in the page is public by design; row-level security protects data. Learners can read and change only their own rows; instructors can read all learner progress. Learner data are for teaching only. Using them for research needs ethics approval and separate consent.

## Hosting
Static single file (`index.html`) on GitHub Pages. Rebuild is not required; replace the file to update.
