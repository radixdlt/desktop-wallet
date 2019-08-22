# Radix Wallet

Radix Wallet software running on Electron, written in Vue.js and Typescript
Built with webpack and electron-builder

## How to use

Install EditoConfig plugin for your editor, to keep the formating consistent [http://editorconfig.org/](http://editorconfig.org/)

Use [yarn](https://yarnpkg.com/en/) instead of [npm](https://www.npmjs.com/) for increased speed

First time setup - run `yarn install`

To build the app, you need to also add 3 licenced fonts to the `src/app/assets/fonts/` directory:

* Gotham-Book.otf
* Gotham-Light.otf
* Gotham-Medium.otf

You can find them here [https://www.cufonfonts.com/font/gotham](https://www.cufonfonts.com/font/gotham)

## Availabe commands

* Run `yarn build` to build code for development
* After than you can run the application with `yarn start` or use F5 in VS Code
* Run tests with `yarn test:unit` after building the application
* Run `yarn build:prod` and `yarn dist:all` to build the application packages for Windows, OS X and Linux

## Contribute

To contribute, fork the latest `release` branch, and make a pull request towards the latest `rc` branch.
