# Audaces Protocol UI

An implementation of a UI for the [Audaces protocol](https://github.com/AudacesFoundation/audaces-perps).

## Starting local environment

```
yarn && yarn start
```

To create a production build that can be served by a static file server:

```
yarn build
```

## Customization

The Audaces protocol UI uses [React](https://reactjs.org/) and [Material UI](https://material-ui.com/). To learn how to customize it, [refer to their official guide](https://material-ui.com/customization/theming/)

## Collecting fees

You can collect 10% of the fees via hosting a UI or sharing your referral link.

### Referral link

Audaces protocol supports referral link via the Solana Naming Service. In order to allow referral links, the environment variable needs to be set to `true`

```
REACT_APP_ALLOW_REF_LINKS=true
```

To disable referral links

```
REACT_APP_ALLOW_REF_LINKS=false
```

In order to create a referral link:

1. Register your Twitter handle using the [Solana Naming Service](https://naming.bonfida.com/#/)
2. Create a USDC account in the wallet linked to your Twitter handle

After completing these two steps, your referral link will be `https://<ui_domain>/ref/<your_twitter_handle>`

### Hosting a UI

You can also collect fees by hosting a UI. In order to collect the fees, you need to modify the `.env` file that looks like this:

```
REACT_APP_REFERRAL_FEES_ADDRESS=
```

To collect fees enter your USDC SPL, for example if your USDC address is `CQkAGKEAXWSMGgd8k7N6QqxBtyz7xfMb4MFHPzC9rVhA`

```
REACT_APP_REFERRAL_FEES_ADDRESS=CQkAGKEAXWSMGgd8k7N6QqxBtyz7xfMb4MFHPzC9rVhA
```

⚠️ It needs to be USDC address, it cannot be a SOL address.

## Hosting

### Github Pages

The UI can be hosted on Github pages using `gh-pages`.

Installing `gh-pages`

```
yarn add -D gh-pages
```

Add the following to the `package.json` file

```json
"predeploy": "git pull --ff-only && yarn && yarn build",
"deploy": "gh-pages -d build"
```

Deployment

```
yarn deploy
```

### IPFS

The UI can be hosted on IPFS pages using `ipfs-deploy`.

Installing `ipfs-deploy`

```
yarn global add ipfs-deploy
```

Add the following to the `package.json` file

```json
"predeploy": "git pull --ff-only && yarn && yarn build",
"deploy": "ipfs-deploy build"
```

Deployment

```
yarn deploy
```

To deploy using Cloudflare refer to the official documentation of `ipfs-deploy`: [https://github.com/ipfs-shipyard/ipfs-deploy](https://github.com/ipfs-shipyard/ipfs-deploy)
