# Agent Skills

A collection of agent skills for improving, polishing, and reviewing resumes and CVs.

## Skills

### [resume-refiner](skills/resume-refiner/SKILL.md)

Improve an existing resume — rewording, restructuring, and visual polish — while preserving the original structure and never fabricating facts. Run it whenever you want to improve a resume, polish a CV, review bullet points, or tailor a resume for a specific role.

## Install

```bash
# Install a single skill
npx skills add bocchii-the-code/resume-skills --skill resume-refiner

# Install all skills in this repo
npx skills add bocchii-the-code/resume-skills --all
```

To use with a specific agent:

```bash
npx skills add bocchii-the-code/resume-skills --skill resume-refiner --agent claude-code
```

## Usage

Ask your agent to improve your resume, e.g.:

> "Improve my resume for a backend engineering role at a tech company. Make the bullet points punchier with stronger action verbs, and bring out my systems and infrastructure work. Keep the LaTeX format."

The skill runs through seven phases — extract facts, scope the assignment, edit, polish, report, surface any layout/typography gaps as decisions, and run a final pre-delivery audit — with an unbreakable rule: **never fabricate.** Everything in the output traces back to facts in the source material.

## Development

This repo is a collection of [Agent Skills](https://skills.sh) following the standard `SKILL.md` format. Each skill lives in its own directory under `skills/`.

## License

MIT
