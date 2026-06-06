# GitHub Upload Runbook

I cannot push to GitHub from the current ChatGPT sandbox because there is no GitHub connector/authenticated GitHub CLI session available here.

This repo is prepared so any authenticated machine can upload it in one command.

## New repo

```bash
unzip math-wild-uv.zip
cd math-wild-uv
bash scripts/push_new_github_repo.sh math-wild private
```

Change `private` to `public` when needed:

```bash
bash scripts/push_new_github_repo.sh math-wild public
```

## Existing repo

```bash
unzip math-wild-uv.zip
cd math-wild-uv
bash scripts/push_existing_github_repo.sh git@github.com:USER/REPO.git
```

## Clone and run from another machine

```bash
git clone git@github.com:USER/REPO.git
cd REPO
uv sync
uv run python render_local.py --quality ql
```

Outputs will appear in `renders/`.
