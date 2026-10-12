# Agent Skills

A collection of agent skills for the job search — improving and polishing resumes, and filling out job applications.

## Skills

### [resume-refiner](skills/resume-refiner/SKILL.md)

Improve an existing resume — rewording, restructuring, and visual polish — while preserving the original structure and never fabricating facts. Run it whenever you want to improve a resume, polish a CV, review bullet points, or tailor a resume for a specific role.

### [fill-job-app](skills/fill-job-app/SKILL.md)

Fill out job application forms end-to-end: inspect the form, create the online profile (uploading and parsing your resume where the platform supports it), batch-fill fields, iterate on validation errors, and leave sensitive fields and the final submission to you. The resume data source can be any format — YAML, PDF, Markdown, or DOCX. Ships with tested helper scripts for Beisen eRecruit portals (hotjob.cn / zhiye.com) plus a general playbook for other platforms such as Workday and custom career sites.

## Install

```bash
# Install a single skill
npx skills add bocchii-the-code/job-searching-skills --skill resume-refiner

# Install all skills in this repo
npx skills add bocchii-the-code/job-searching-skills --all
```

To use with a specific agent:

```bash
npx skills add bocchii-the-code/job-searching-skills --skill resume-refiner --agent claude-code
```

## Usage

Ask your agent to improve your resume, e.g.:

> "Improve my resume for a backend engineering role at a tech company. Make the bullet points punchier with stronger action verbs, and bring out your systems and infrastructure work. Keep the LaTeX format."

The skill runs through seven phases — extract facts, scope the assignment, edit, polish, report, surface any layout/typography gaps as decisions, and run a final pre-delivery audit — with an unbreakable rule: **never fabricate.** Everything in the output traces back to facts in the source material.

For job applications:

> "Help me fill out this job application: <job posting URL>. Use my resume from this repo."

It inspects the form, finds and prepares your resume (rendering or converting it if the platform needs a different format), fills the fields, and iterates on validation errors — sensitive fields (ID number, family details, photo, signature) and the final submit stay with you.

## Development

This repo is a collection of [Agent Skills](https://skills.sh) following the standard `SKILL.md` format. Each skill lives in its own directory under `skills/`.

## License

MIT
