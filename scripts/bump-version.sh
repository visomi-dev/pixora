#!/bin/bash

# Script to automatically bump version when libs/pixora is modified

# Exit if not in a git repo
git rev-parse --is-inside-work-tree > /dev/null 2>&1 || exit 0

# Get list of changed files (staged + unstaged)
CHANGED_FILES=$(git diff --name-only HEAD)

# Check if any file in libs/pixora was changed
if echo "$CHANGED_FILES" | grep -q "^libs/pixora/"; then
  echo "Library files modified, checking version bump..."

  # Check if version bump is needed (commit message should contain bump directive)
  LAST_COMMIT_MSG=$(git log -1 --pretty=%B HEAD)
  
  if echo "$LAST_COMMIT_MSG" | grep -qiE "(bump|release|publish|version)"; then
    echo "Version bump already in commit message, skipping..."
    exit 0
  fi

  # Determine bump type from commit message or default to patch
  BUMP_TYPE="patch"  # default
  
  if echo "$LAST_COMMIT_MSG" | grep -qiE "BREAKING|breaking.?change"; then
    BUMP_TYPE="major"
  elif echo "$LAST_COMMIT_MSG" | grep -qiE "^feat|feature"; then
    BUMP_TYPE="minor"
  fi

  echo "Bumping $BUMP_TYPE version for libs/pixora..."
  
  # Read current version
  CURRENT_VERSION=$(node -p "require('./libs/pixora/package.json').version")
  echo "Current version: $CURRENT_VERSION"
  
  # Bump version using standard semver
  VERSION_PARTS=(${CURRENT_VERSION//./ })
  MAJOR=${VERSION_PARTS[0]}
  MINOR=${VERSION_PARTS[1]}
  PATCH=${VERSION_PARTS[2]}

  case $BUMP_TYPE in
    major)
      MAJOR=$((MAJOR + 1))
      MINOR=0
      PATCH=0
      ;;
    minor)
      MINOR=$((MINOR + 1))
      PATCH=0
      ;;
    patch)
      PATCH=$((PATCH + 1))
      ;;
  esac

  NEW_VERSION="$MAJOR.$MINOR.$PATCH"
  echo "New version: $NEW_VERSION"

  # Update version in package.json
  node -e "
    const fs = require('fs');
    const pkg = require('./libs/pixora/package.json');
    pkg.version = '$NEW_VERSION';
    fs.writeFileSync('./libs/pixora/package.json', JSON.stringify(pkg, null, 2) + '\n');
  "

  # Stage the changes
  git add libs/pixora/package.json
  
  echo "Version bumped to $NEW_VERSION and staged for commit"
fi
