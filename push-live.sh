#!/usr/bin/env bash
# Push main to origin, wait for the GitHub Action (incl. its auto-commit run) to
# finish, then push the resulting main to the live repo.
set -euo pipefail

API=https://api.github.com/repos/bkhpanigha/hh-suttas/actions/runs?branch=main
TIMEOUT=${TIMEOUT:-1200}   # seconds
KEY=${KEY:-~/.ssh/id_ed25519}

# Private agent for this script only: the login agent's key can expire mid-run,
# and both pushes are minutes apart. Dies with the script, leaves no key behind.
eval "$(ssh-agent -s)" >/dev/null
trap 'ssh-agent -k >/dev/null 2>&1' EXIT
ssh-add "${KEY/#\~/$HOME}"

git pull --ff-only origin main
git push origin main

echo "waiting for workflow runs to finish..."
sleep 15   # let the new run register
deadline=$((SECONDS + TIMEOUT))
while (( SECONDS < deadline )); do
  pending=$(curl -sf "$API&per_page=10" \
    | grep -c '"status": "\(queued\|in_progress\|waiting\|requested\|pending\)"' || true)
  [[ $pending -eq 0 ]] && break
  echo "  $pending run(s) still going..."
  sleep 20
done
(( SECONDS < deadline )) || { echo "timed out waiting for Actions"; exit 1; }

git pull --ff-only origin main
git push live main
echo "pushed to live"
