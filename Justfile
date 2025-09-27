serve:
	bundle exec jekyll serve

deploy branch="public":
	bundle exec jekyll build
	set -eu; tmp="$(mktemp -d)"; git worktree add --force -B "{{branch}}" "$tmp" "origin/{{branch}}" 2>/dev/null || git worktree add --force -B "{{branch}}" "$tmp" "{{branch}}"; rsync -a --delete --exclude ".git" "_site/" "$tmp/"; git -C "$tmp" add -A; if ! git -C "$tmp" diff --cached --quiet; then git -C "$tmp" commit -m "Deploy $(date -u +'%Y-%m-%d %H:%M:%S UTC')"; git -C "$tmp" push origin "{{branch}}"; else echo "No changes to deploy."; fi; git worktree remove "$tmp"
