#!/bin/bash

# Script to automatically bump version when libs/pixora is modified

# Exit if not in a git repo
git rev-parse --is-inside-work-tree > /dev/null 2>&1 || exit 0

# Get list of changed files (staged + unstaged)
CHANGED_FILES=$(git diff --name-only HEAD)

# Files that contain version references
INSTALLATION_DOC="apps/docs/content/docs/getting-started/installation.md"
SHELL_LAYOUT="apps/docs/src/layouts/docs-shell.astro"
INDEX_PAGE="apps/docs/src/pages/index.astro"
EXAMPLES_DOC="apps/docs/content/docs/examples/space-invaders.md"

# Function to update all docs version references
update_docs_version() {
  local NEW_VERSION=$1
  
  # Update installation.md - npm/yarn/pnpm install commands
  if [ -f "$INSTALLATION_DOC" ]; then
    sed -i "s/pixora@0\.[0-9]\+\.[0-9]\+/pixora@$NEW_VERSION/g" "$INSTALLATION_DOC"
    echo "Updated $INSTALLATION_DOC"
  fi
  
  # Update docs-shell.astro - sidebar version badge
  if [ -f "$SHELL_LAYOUT" ]; then
    sed -i "s/Engine v0\.[0-9]\+\.[0-9]\+/Engine v$NEW_VERSION/g" "$SHELL_LAYOUT"
    echo "Updated $SHELL_LAYOUT"
  fi
  
  # Update index.astro - hero release badge
  if [ -f "$INDEX_PAGE" ]; then
    sed -i "s/v0\.[0-9]\+\.[0-9]\+ Engine Release/v$NEW_VERSION Engine Release/g" "$INDEX_PAGE"
    echo "Updated $INDEX_PAGE"
  fi
  
  # Update space-invaders.md - GitHub link
  if [ -f "$EXAMPLES_DOC" ]; then
    sed -i "s|visomi-dev/pixora/tree/v0\.[0-9]\+\.[0-9]\+|visomi-dev/pixora/tree/v$NEW_VERSION|g" "$EXAMPLES_DOC"
    echo "Updated $EXAMPLES_DOC"
  fi
}

# Function to validate docs version matches library version
validate_docs_version() {
  local LIBRARY_VERSION=$(node -p "require('./libs/pixora/package.json').version")
  
  if [ -f "$INSTALLATION_DOC" ]; then
    local DOCS_VERSION=$(grep -oP 'pixora@\K[0-9]+\.[0-9]+\.[0-9]+' "$INSTALLATION_DOC" | head -1)
    
    if [ "$LIBRARY_VERSION" != "$DOCS_VERSION" ]; then
      echo "ERROR: Version mismatch detected!"
      echo "  Library version: $LIBRARY_VERSION"
      echo "  Docs version (installation.md): $DOCS_VERSION"
      echo "  Please run 'pnpm run version:bump' to sync versions"
      exit 1
    fi
  fi
}

# Check if --validate-only flag is passed (for pre-commit hook)
if [ "$1" = "--validate-only" ]; then
  validate_docs_version
  exit $?
fi

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

  # Update version in all docs files
  update_docs_version "$NEW_VERSION"

  # Stage the changes
  git add libs/pixora/package.json
  git add "$INSTALLATION_DOC"
  git add "$SHELL_LAYOUT"
  git add "$INDEX_PAGE"
  git add "$EXAMPLES_DOC"
  
  echo "Version bumped to $NEW_VERSION and staged for commit"
fi
