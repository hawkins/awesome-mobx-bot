# awesome-mobx-bot

> a GitHub App built with [probot](https://github.com/probot/probot) that automates awesome-list related tasks for the Awesome MobX List

## Setup

```
# Install dependencies
yarn install

# Run the bot
yarn start
```

## Configuring

The following values environment variables are needed to run the bot:

- `APP_ID`: Your GitHub App ID
- `PRIVATE_KEY_PATH`: Path to your GitHub-provided Private Key
- `WEBHOOK_PROXY_URL`: A URL provided by [smee.io](https://smee.io)
- `WEBHOOK_SECRET`: Secret set in your GitHub App settings

## Testing

### Simulating webhooks

```
# Pick a fixture and action, then sub in here
probot simulate issues __tests__/fixtures/issue_link_primitive.json index.js
```

## Deployment

See [docs/deploy.md](docs/deploy.md) if you would like to run your own instance of this app.
