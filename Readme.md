# Orbs contracts js
[![npm version](https://badge.fury.io/js/%40orbs-network%2Fcontracts-js.svg)](https://badge.fury.io/js/%40orbs-network%2Fcontracts-js)

Orbs contracts js is a library that provides easy to use interfaces to communicate with the Orbs contracts that are deployed on the Ethereum blockchain.

## Installation

```bash
npm install @orbs-universe/contracts-js
```

## Usage

1.Initialize a web3 object (in this specific example we will use the 'ethereum provider' injected by MetaMask)
```ts
// MetaMask injects an ethereum provider straight to the window
import Web3 from "web3";

const ethereumProvider = (window as any).ethereum;
const web3 = new Web3(ethereumProvider as any);
```

2.Initialize an instance of a service (They all have the same constructor parameters)
```ts
import { IOrbsTokenService, OrbsTokenService } from '@orbs-network/contracts-js';

const orbsTokenService: IOrbsTokenService = new OrbsTokenService(web3);
```

3.Use the service to interact with the ethereum contracts in a js native way -- easy and convenient way to interact with the contracts that are deployed on Ethereum.
```ts
// Lets say this address holds 5,000 orbs
const myOrbsAccountAddress = '0x12BF4263560Ce9a3cADD20B0b36208d131b64f87';
const balance = await orbsTokenService.readBalance(myOrbsAccountAddress);

// will print "5000"
console.log(balance)
```
 

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License
[ISC](https://choosealicense.com/licenses/isc/)