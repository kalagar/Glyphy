<!--
  Versioning is automated. Name your branch by type and write the PR title as a
  conventional commit matching it — the PR title becomes the squash commit that
  Release Please reads to bump the version:

    feature/… or feat/…      -> title "feat: …"   -> MINOR
    fix/… bug/… bugfix/…      -> title "fix: …"    -> PATCH
    hotfix/…                  -> title "fix: …"    -> PATCH
    breaking/…                -> title "feat!: …"  -> MAJOR
    chore/ docs/ ci/ refactor/ test/ perf/ -> matching type (most: no release)

  The PR Title Guard check enforces this.
-->

## What changed and why

<!-- Brief description of the change and its motivation -->

## Test plan

- [ ] Loaded extension as unpacked in Chrome
- [ ] Tested on at least 2–3 different sites
- [ ] Icon fonts (Material Icons / Font Awesome) still render correctly
- [ ] No console errors on affected pages

## Related issues

Closes #
