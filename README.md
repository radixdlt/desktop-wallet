[![License MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

# Radix Desktop Wallet ⚠⚠[DEPRECATED]⚠⚠

The Desktop Wallet runs on Electron, is written in [Vue.js](https://vuejs.org/) and [TypeScript](https://www.typescriptlang.org/), and is built with [webpack](https://webpack.js.org/) and [electron-builder](https://www.electron.build/).

## Table of contents

- [Changelog](CHANGELOG.md)
- [Requirements](#requirements)
- [First time setup](#first-time-setup)
- [Building and running](#building-and-running)
- [Building for distribution](#building-for-distribution)
- [Connect to a custom universe](#connect-to-a-custom-universe)
- [Contribute](#contribute)
- [Links](#links)
- [License](#license)

## Requirements

- [Node.js](https://nodejs.org/en/)
- [Yarn](https://yarnpkg.com/)

## First time setup

Run `yarn install`

## Building and running

- Run `yarn build` to build code for development
- Run `yarn build:watch` to build continually
- After than you can run the application with `yarn start` or use F5 in VS Code

## Building for distribution

### Setting up code signing

You need two different code signing certificates, one for MacOS and one for Windows. Create an electron-builder.env file in the root directory of the project.

```
CSC_LINK=/path/to/code_sign_apple.p12
CSC_KEY_PASSWORD={password "code_sign_apple.p12"}
WIN_CSC_LINK=/path/to/code_sign.p12
WIN_CSC_KEY_PASSWORD={password "code_sign.p12"}
APPLEID={login "Apple Desktop Code Signing App-specific"}
APPLEIDPASS={password "Apple Desktop Code Signing App-specific"}
```

### Building release artefacts

1. `yarn build:prod` (takes 3-4 minutes)
2. `yarn dist:all` - this will take about 10 minutes without showing much progress at some points, don't worry
3. Alternatively it is possible to build for a specific platform only - `yarn dist:mac`, `yarn dist:linux`, `yarn dist:windows`
4. You will find the build artefacts in the `dist` folder - .exe for Windows, .appimage for Linux and .dmg for OS X

## Connect to a custom universe

Put a `universe.json` file in the root of the project, with the following structure:

```
{
    "universeConfig": {
        ...
        universe config json
        ...
    }
    "nodeAddress": <IP address>,
    "useSSL": <true | false>,
    "faucetAddress": <optional, if a faucet service exists for the network>
}
```

## Contribute

[Contributions](CONTRIBUTING.md) are welcome, we simply ask to:

- Fork the latest `release` branch
- Make a pull request towards the latest `rc` branch
- Submit a pull request for review

Install [EditorConfig plugin](http://editorconfig.org/) for your editor, to keep the formating consistent.

When contributing to this repository, we recommend discussing with the development team the change you wish to make using a [GitHub issue](https://github.com/radixdlt/desktop-wallet/issues) before making changes.

Please follow our [Code of Conduct](CODE_OF_CONDUCT.md) in all your interactions with the project.

## Links

| Link | Description |
| :----- | :------ |
[radixdlt.com](https://radixdlt.com/) | Radix DLT Homepage
[documentation](https://docs.radixdlt.com/) | Radix Knowledge Base
[forum](https://forum.radixdlt.com/) | Radix Technical Forum
[@radixdlt](https://twitter.com/radixdlt) | Follow Radix DLT on Twitter

## License

The Radix Desktop Wallet is released under the [MIT License](LICENSE).
