#!/bin/sh

# Check if "origin" remote exists
origin_url=$(git remote get-url origin 2>/dev/null)

if [ -z "$origin_url" ]; then
    echo "--- Error: 'origin' remote does not exist. Exiting script."
    exit 1
fi

# Start from main branch
git checkout main

# Create fresh dist/ folder
rm -rf dist/

# Run build
npm run build

# Switch to gh-pages branch
buildBranch=gh-pages

# Check if the local branch exists
if git show-ref --quiet refs/heads/"$buildBranch"; then
    echo "--- Local branch '$buildBranch' exists."
    git checkout "$buildBranch"
else
    echo "--- Local branch '$buildBranch' does not exist."
    git checkout -b "$buildBranch"
fi

# Check if the remote branch exists
if git ls-remote --heads origin "$buildBranch" | grep -q "$buildBranch"; then
    echo "--- Remote branch '$buildBranch' exists."
else
    git push -u origin "$buildBranch"
    echo "--- Remote branch '$buildBranch' created."
fi

# Move everything from dist/ delete everything except dist & excluded
rsync --delete-after --recursive \
      --exclude=.git \
      dist/ .

# Commit and push
git add .
git commit -m "deploy gh-pages"
git push

# Return to main branch
git checkout main