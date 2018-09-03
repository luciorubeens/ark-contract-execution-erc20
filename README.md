# ARK Core - Contract Execution ERC20

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

This plugin provides a simple way to execute methods and listen events for any ERC20 contract.

## Prerequisites
- Setup development environment
  - via docker https://docs.ark.io/docs/docker or
  - git clone https://github.com/arkecosystem/core

## Installation

```bash
cd core
cd plugins
git clone https://github.com/luciorubeens/ark-contract-execution-erc20

lerna bootstrap
```

## Configuration
Add and adjust the following setup from [defaults.js](./lib/defaults.js) to the network setup file for plugins loading. `plugins.json` for selected network can be found in [`@arkecosystem/core`](https://github.com/ArkEcosystem/core/blob/master/packages/core/lib/config/testnet/plugins.js#L98). Parent folder is the name of your network.

## Example - CryptoKitties

The CryptoKitties contract can be found [here](https://etherscan.io/address/0x06012c8cf97bead5deae237070f9587f8e7a266d).

- Copy the `Contract ABI` in the [Code tab](https://etherscan.io/address/0x06012c8cf97bead5deae237070f9587f8e7a266d#code).
- Paste the ABI and contract address into the [defaults.js](./lib/defaults.js).

Now you can listen for a specific event in another plugin:

```js
emitter.on('erc20.Birth', data => {
  console.log(data.resultValues) // { owner:..., kittyId:..., matronId:..., sireId:..., genes:... }
})
```

Calling a specific method by emitter or container:

> By emitter

```js
emiiter.emit('erc20', {
  method: 'isPregnant',
  params: [<MyKittyId>],
  callback: async (isPregnant) => console.log(await isPregnant.call()) // false
})
```

> By container

```js
const erc20 = require('@arkecosystem/core-container').resolvePlugin('erc20')
const isPregnant = await erc20.trigger('isPregnant', '<MyKittyId>').call()
```

## Running
- Go to `@arkecosystem/core` package
- Start your node in test mode (or and other) `yarn start:testnet`
- Wait for messages and check console output

Feel free to further explore the possible events and conditions. A list of events ca be found here: https://docs.ark.io/docs/events#section-available-events

## Security
If you discover a security vulnerability within this package, please send an e-mail to security@ark.io. All security vulnerabilities will be promptly addressed.

## Credits

- [Lúcio Rubens](https://github.com/luciorubeens)

## License

[MIT](LICENSE) © [ArkEcosystem](https://ark.io)
