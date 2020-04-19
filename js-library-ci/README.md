# Javascript library CI action

This action runs configured lint and test scripts for a project.

## Assumptions

This action assumes that:

 * You have scripts configured that can be executed via `npm run lint` and `npm test`.

## Usage

This action can be run using the following YAML:

```yaml
name: CI

on: push

jobs:
  build:
    name: Build
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v1

      - name: Use Node.js 12
        uses: actions/setup-node@v1
        with:
          node-version: 12

      - name: Build
        uses: raing3/actions/js-library-ci@master
```