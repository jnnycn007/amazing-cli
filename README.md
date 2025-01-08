# Amazing Cli

## Install

```sh
pnpm add -g amazing-cli
# or
npm install -g amazing-cli
# or
yarn add amazing-cli -g
```

## Usage

### Create a new Template project

```sh
amazing-cli create
# or
amazing-cli create <project-name>
# or
amazing-cli create <project-name> -t <template-name>
```

### Pull and merge remote template project into the current project branch

```sh
amazing-cli pull
# or
amazing-cli pull -c <current-branch> -t <template-branch>
```

## Use Npx

### Create a new Template project

```sh
npx amazing-cli create
# or
npx amazing-cli create <project-name>
# or
npx amazing-cli create <project-name> -t <template-name>
```

### Example

```sh
npx amazing-cli create vue-project -template web-vue
```
