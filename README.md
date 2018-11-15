# awesome-mobx-bot

> a GitHub App built with [probot](https://github.com/probot/probot) that automates awesome-list related tasks for the Awesome MobX List

## Setup

```sh
# See below to configure the environment variables as needed

# Install dependencies
yarn install

# Run the bot (in local development)
yarn run dev

# Run the bot (in production)
yarn start
```

## Configuring

The following environment variables are needed to run the bot:

- `APP_ID`: Your GitHub App ID
- Private key
  - `PRIVATE_KEY_PATH`: Path to your GitHub-provided Private Key (recommended for local development)
  - `PRIVATE_KEY`: String form of your GitHub-provided Private Key (recommended for production on Now.sh)
- `WEBHOOK_PROXY_URL`: A URL provided by [smee.io](https://smee.io) (for development only)
- `WEBHOOK_SECRET`: Secret set in your GitHub App settings

## Testing

### Simulating webhooks

```sh
# Pick a fixture and action, then sub in here
probot simulate issues __tests__/fixtures/issue_link_primitive.json index.js
```

## Deployment

Configure now by adding secrets:

```sh
now secrets add mobxbot-webhook-secret <SECRET_GOES_HERE>
now secrets add mobxbot-private-key "$(cat private-key*.pem | base64)"

# Finally deploy the app
now
now alias
```

See [docs/deploy.md](docs/deploy.md) if you would like to run your own instance of this app.
