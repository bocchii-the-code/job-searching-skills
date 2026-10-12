# Job Searching Skills

A collection of agent skills for the job search — improving and polishing resumes, filling out job applications, and planning the search itself. 

> Job hunting shouldn't be a burden to any of us.

## Skills

### [resume-refiner](skills/resume-refiner/SKILL.md)

Improve an existing resume — rewording, restructuring, and visual polish — while preserving the original structure and never fabricating facts. Run it whenever you want to improve a resume, polish a CV, review bullet points, or tailor a resume for a specific role.

### [fill-job-app](skills/fill-job-app/SKILL.md)

Fill out job application forms end-to-end: inspect the form, create the online profile (uploading and parsing your resume where the platform supports it), batch-fill fields, iterate on validation errors, and leave sensitive fields and the final submission to you. The resume data source can be any format — YAML, PDF, Markdown, or DOCX. Ships with tested helper scripts for Beisen eRecruit portals (hotjob.cn / zhiye.com) plus a general playbook for other platforms such as Workday and custom career sites. It is self-contained — no specific plugins required: any agent that can drive a browser can run it, and it degrades to step-by-step guidance when no browser tool is available.

### [career-consulting](skills/career-consulting/SKILL.md)

Acts as a job-search consultant: it looks over your job hunting documents and says what needs doing right now — deadlines coming up, listings that haven't been checked recently, links that stopped opening — researches new companies and markets, helps weigh internships against full-time roles, and keeps your running documents up to date. Ships with four guides: research and document rules, a decision framework, a visa quick guide by country, and a link-verification guide that explains step by step how to confirm a job posting is still open. Self-contained — no plugins required: any agent can run it, browser help is optional, and every check reports how confident its result really is.

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

> "Help me fill out this job application: <job posting URL></job>. Use my resume from this repo."

It inspects the form, finds and prepares your resume (rendering or converting it if the platform needs a different format), fills the fields, and iterates on validation errors — sensitive fields (ID number, family details, photo, signature) and the final submit stay with you.

For the search itself:

> "Go over my job hunting documents: what's closing soon, what needs re-checking, and what should I apply to next?"

It scans your documents for upcoming deadlines and stale listings, re-checks links that may have stopped working, and updates the documents with what it found — so the next action is always obvious.

## Development

This repo is a collection of [Agent Skills](https://skills.sh) following the standard `SKILL.md` format. Each skill lives in its own directory under `skills/`.

## License

MIT
