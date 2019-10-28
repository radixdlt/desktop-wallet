[![License MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

# Radix Wallet

Radix Wallet software running on Electron, written in Vue.js and Typescript
Built with webpack and electron-builder

## Table of contents

- [Changelog](CHANGELOG.md)
- [Requirements](#requirements)
- [How to use](#how-to-use)
- [Available commands](#available-commands)
- [Contribute](#contribute)
- [Links](#links)
- [License](#license)

## Requirements

To build the app, you need to also add 3 licenced fonts to the `src/app/assets/fonts/` directory:

* Gotham-Book.otf
* Gotham-Light.otf
* Gotham-Medium.otf

You can find them here [https://www.cufonfonts.com/font/gotham](https://www.cufonfonts.com/font/gotham)

## How to use

Install EditoConfig plugin for your editor, to keep the formating consistent [http://editorconfig.org/](http://editorconfig.org/)

Use [yarn](https://yarnpkg.com/en/) instead of [npm](https://www.npmjs.com/) for increased speed

### First time setup 

Run `yarn install`

## Available commands

* Run `yarn build` to build code for development
* After than you can run the application with `yarn start` or use F5 in VS Code
* Run tests with `yarn test:unit` after building the application
* Run `yarn build:prod` and `yarn dist:all` to build the application packages for Windows, OS X and Linux

## Contribute

To contribute, fork the latest `release` branch, and make a pull request towards the latest `rc` branch.



[Contributions](CONTRIBUTING.md) are welcome, we simply ask to:

* Fork the codebase
* Make changes
* Submit a pull request for review

When contributing to this repository, we recommend discussing with the development team the change you wish to make using a [GitHub issue](https://github.com/radixdlt/radixdlt-js/issues) before making changes.

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

