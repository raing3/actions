# Javascript library publish action

This action publishes new releases to GitHub and NPM when a new tag is pushed to a JS library repository.

## Usage

This action can be run using the following YAML:

```yaml
name: CI

on: push

jobs:
  publish:
    name: Publish
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v1

      - name: Publish
        uses: raing3/actions/js-library-publish@master
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          npm_token: ${{ secrets.NPM_TOKEN }}
```

To tag a new version run the following command and push the tag that is created:

```
# Single package repositories
npm version <patch|minor|major>

# Lerna monorepo repositories
lerna version <patch|minor|major>
```
