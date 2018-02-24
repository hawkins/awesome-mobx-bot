# awesome-mobx-bot

> a GitHub App built with [probot](https://github.com/probot/probot) that automates awesome-list related tasks for the Awesome MobX List

## Setup

```
# Install dependencies
yarn install

# Run the bot
yarn start
```

## Testing

### Simulating webhooks

```
# Pick a fixture and action, then sub in here
probot simulate issues __tests__/fixtures/issue_link_primitive.json index.js
```

## Deployment

See [docs/deploy.md](docs/deploy.md) if you would like to run your own instance of this app.
