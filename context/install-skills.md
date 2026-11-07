# install-skills.md — Linguo

Instructions for installing agent skills into this project. Follow the steps in order. This is a one-time setup task; it is NOT part of `implementation-plan.md`. Do not start any task from `implementation-plan.md` during this session.

## 1. Skills to install
| Skill | Source | Purpose | Required |
| --- | --- | --- | --- |
| `capacitor-plugins` | `capawesome-team/skills` | Install, configure, and use Capacitor plugins (official, community, ML Kit) | Yes |
| `ionic-angular` | `capawesome-team/skills` | Ionic + Angular patterns: standalone components, navigation, lifecycle hooks | Yes |
| `ionic-design` | `cap-go/capacitor-skills` (also seen as `cap-go/capgo-skills`) | Ionic design guidance for native-looking Capacitor apps | Yes, subject to the extra checks in section 5 |
| `frontend-design` | `anthropics/skills` | General visual design guidance | **NO. Install only if the user explicitly says so.** |

MUST NOT install any other skill from these repositories or any other source. Do not run `npx skills add <repo>` without `--skill` (that installs everything).

## 2. Prerequisites
1. Confirm Node.js and npm are available: run `node -v` and `npm -v`. If either is missing, STOP and tell the user.
2. Confirm the current directory is the Linguo project root (the folder containing `agents.md` and `concept.md`). If not, STOP and ask.

## 3. Check the installer
1. Run `npx skills add --help`.
2. Read the output. Note whether an option exists to choose the target agent, and whether `opencode` is a supported target.
3. Do NOT guess flags. Use only flags shown in the help output.

## 4. Install
Run these commands separately, adding the target-agent flag for OpenCode only if step 3 showed it is supported:
```bash
npx skills add capawesome-team/skills --skill capacitor-plugins
npx skills add capawesome-team/skills --skill ionic-angular
```
Then, for `ionic-design`, follow section 5 first. If the installer asks questions interactively (target agent, project vs global scope), choose:
- Agent: OpenCode (if listed).
- Scope: **project** (not global), so the skills live with this project.

## 5. Extra checks for `ionic-design` (third-party, low install count)
1. The repository name is reported inconsistently (`cap-go/capacitor-skills` or `cap-go/capgo-skills`). Try `cap-go/capacitor-skills` first:
   ```bash
   npx skills add cap-go/capacitor-skills --skill ionic-design
   ```
   If the repository or skill is not found, try `cap-go/capgo-skills`. If neither provides a skill named `ionic-design`, STOP and report. Do not install a different skill instead.
2. After installing, open its `SKILL.md` and all files it references. Check that it does not:
   - tell the agent to add Tailwind, Konsta UI, Angular Material, or any other UI library,
   - require NgModules (this project uses standalone components only),
   - run unrelated commands, read secrets or environment variables, or contact unknown websites.
3. If it contains any of the above, STOP and report to the user. Do not continue until the user decides.
4. Even if it passes, `design.md` and `agents.md` ALWAYS override this skill.

## 6. Verify
1. List the installed skill folders. Show the user the exact paths.
2. Confirm that `SKILL.md` exists in each installed skill folder.
3. Open each `SKILL.md` and show the user its `name` and `description` lines.
4. Skim each `SKILL.md` for anything unexpected (see the checks above). If found, STOP and report.

## 7. If installation fails or OpenCode is not detected
- STOP and report: the exact command, the full error output, and what the installer printed about supported agents.
- Do NOT write skill files by hand and do NOT download them with other tools.
- Do NOT change global settings or install anything outside this project.
- Wait for the user's instructions.

## 8. Update agents.md
After a successful install, append this section to the end of `agents.md` (do not change any other part of the file). List only the skills that were actually installed:

```markdown
## 9. Skills
Installed skills: `capacitor-plugins`, `ionic-angular`, `ionic-design`.
- Use `capacitor-plugins` when installing or configuring a Capacitor plugin.
- Use `ionic-angular` when working on Ionic/Angular structure, navigation, or lifecycle hooks.
- Use `ionic-design` when building or changing UI, together with `design.md`.
- Priority: `agents.md`, `tech-stack.md`, and `design.md` ALWAYS override a skill. If a skill suggests a package, version, library, or feature that is not allowed in `tech-stack.md` or is forbidden in `agents.md` or `design.md`, ignore that suggestion and tell the user.
- Skills do not replace reading the relevant file in `docs/` and the type definitions in `node_modules/<package>/` before using a plugin.
```

## 9. Finish
1. Update `progress.md`: add a line under "Completed tasks": `date — install-skills — installed <list of skills> (project scope)`. Add the install location and any warnings under "Notes for next session".
2. Report to the user in 2–4 sentences: what was installed, where, and whether OpenCode detected the skills.
3. STOP. Do not start `implementation-plan.md` task 1.1 unless the user asks.
