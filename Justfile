set windows-shell := ["powershell.exe", "-NoLogo", "-Command"]

serve:
    bundle exec jekyll serve

[unix]
deploy branch="public":
    bundle exec jekyll build
    set -eu; tmp="$(mktemp -d)"; git worktree add --force -B "{{branch}}" "$tmp" "origin/{{branch}}" 2>/dev/null || git worktree add --force -B "{{branch}}" "$tmp" "{{branch}}"; rsync -a --delete --exclude ".git" "_site/" "$tmp/"; [ -f CNAME ] && cp -f CNAME "$tmp/CNAME"; [ -f CNNAME ] && cp -f CNNAME "$tmp/CNNAME"; git -C "$tmp" add -A; if ! git -C "$tmp" diff --cached --quiet; then git -C "$tmp" commit -m "Deploy $(date -u +'%Y-%m-%d %H:%M:%S UTC')"; git -C "$tmp" push origin "{{branch}}"; else echo "No changes to deploy."; fi; git worktree remove "$tmp"

[windows]
deploy branch="public":
    bundle exec jekyll build
    $branch = "{{branch}}"; $tmp = Join-Path $env:TEMP ([System.IO.Path]::GetRandomFileName()); New-Item -ItemType Directory -Path $tmp | Out-Null; git worktree add --force -B $branch "$tmp" "origin/$branch" 2>$null; if ($LASTEXITCODE -ne 0) { git worktree add --force -B $branch "$tmp" $branch }; Get-ChildItem $tmp | Where-Object { $_.Name -ne ".git" } | Remove-Item -Recurse -Force; Copy-Item -Path "_site\*" -Destination $tmp -Recurse -Force; if (Test-Path CNAME) { Copy-Item CNAME (Join-Path $tmp "CNAME") -Force }; if (Test-Path CNNAME) { Copy-Item CNNAME (Join-Path $tmp "CNNAME") -Force }; git -C "$tmp" add -A; git -C "$tmp" diff --cached --quiet; $hasChanges = $LASTEXITCODE -ne 0; if ($hasChanges) { $date = (Get-Date).ToUniversalTime().ToString("yyyy-MM-dd HH:mm:ss UTC"); git -C "$tmp" commit -m "Deploy $date"; git -C "$tmp" push origin $branch } else { Write-Host "No changes to deploy." }; git worktree remove "$tmp"
