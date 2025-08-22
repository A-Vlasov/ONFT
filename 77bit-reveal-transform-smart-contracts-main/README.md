# 77bit Smart Contracts

## Overview

This repository contains the smart contracts for the 77bit project:

1. [SevenSevenBit](./contracts/77bit/SevenSevenBit.sol) - ERC721A contract that represents a new NFT collection for 77-bit.com project.
    - Total supply of tokens is limited to 7777
    - Contract implements ERC721A interface
    - The contract is upgradeable using OpenZeppelin Proxy pattern
    - The contract is LayerZero-compatible. There are no specific LayerZero functions in the contract,
      but is proven by tests to work with LayerZero contracts with the [77bit-layerzero](./contracts/77bit-layerzero) extension.
2. [RagnarokTransform](./contracts/transform/RagnarokTransform.sol) -
   contract that allows to upgrade users' old Ragnarok NFTs to new ones from SevenSevenBit collection.

    - Before using the contract, owner of SevenSevenBit contract should register RagnarokTransform as a minter
    - During the art-upgrade process the contract will **burn** user's Ragnarok tokens
      and then mint SevenSevenBit tokens to the user's account
    - Amount of SevenSevenBit tokens that will be minted to a user is equal to the amount of burned Ragnarok tokens
    - IDs of the newly minted SevenSevenBit tokens are not restricted to be equal to the IDs of the burned Ragnarok tokens and will be generated sequentially
    - After a user's successful art-upgrade, an ArtUpgrade event will be emitted
      and Transformation Backend will be able to update new SevenSevenBit tokens' image and metadata

    The contract also contains re-roll functionality: SevenSevenBit NFTs can be upgraded using SecureLiquidDigitalChips

    - Re-roll process expects that calling user already has SevenSevenBit and SecureLiquidDigitalChip tokens
      and will upgrade SevenSevenBit tokens using SecureLiquidDigitalChip tokens.
    - From the blockchain perspective, the re-roll process only means permanent locking of SecureLiquidDigitalChip tokens on the transform contract's address.
    - After re-roll process, the ReRoll event will be emitted
      and Transformation Backend will be able to update new SevenSevenBit tokens' image and metadata
    - IMPORTANT: current implementation does not restrict the number of re-rolls for a single token. User is free to re-roll the same token multiple times with or without SecureLiquidDigitalChip tokens.

3. Set of utility contracts:
    1. RagnarokMock - Copy of Ragnarok contract for testing purposes
    2. SecureLiquidDigitalChipMock - Copy of current SecureLiquidDigitalChip contract for testing purposes
    3. SevenSevenBitMock - Mock contract for testing purposes
    4. [contracts/layerzero](./contracts/layerzero) - LayerZero contracts for prototyping purposes copied from [this repository](https://github.com/LayerZero-Labs/solidity-examples)
    5. [Omni-chain extension for SevenSevenBit](./contracts/77bit-layerzero) - Set of contracts providing omni-chain functionality for SevenSevenBit collection.
       These contracts haven't been tested well and were used only to prove the possibility of using SevenSevenBit collection on multiple chains.

## Technologies

-   [Hardhat](https://hardhat.org/) - Ethereum development environment for professionals
-   [Typechain](https://github.com/dethcrypto/TypeChain) plugin enabled (typescript type bindings for smart contracts)
-   [hardhat-deploy](https://github.com/wighawag/hardhat-deploy) plugin enabled
-   [hardhat-upgrades](https://www.npmjs.com/package/@openzeppelin/hardhat-upgrades) plugin enabled for proxy contracts
-   Testing environment configured and operational, with test coverage
-   Prettier and eslint configured for project files and solidity smart contract
-   [Solhint](https://github.com/protofire/solhint) configured for enforcing best practices
-   Github actions workflows prepared for CI/CD

## Network Configuration

Only Sepolia and Mainnet Ethereum networks are configured in the project. You can add more networks in `hardhat.config.ts` file.

## Usage

#### 0. Learn Hardhat Shorthand

```shell
# We recommend installing `hh autocomplete` so you can use `hh` shorthand globally.
#  https://hardhat.org/guides/shorthand.html
npm i -g hardhat-shorthand

hh compile ## to compile smart contract and generate typechain ts bindings
hh test ## to run tests
hh deploy ## to deploy to local network (see options for more)
hh node ## to run a localhost node
hh help ## to see all available commands
hh TABTAB ## to use autocomplete
```

#### 1. Install Dependencies

```shell
npm install
```

#### 2. Compile Contracts

```shell
npm run compile
```

#### 3. Environment Setup

Create `.env` file and add your environment variables. You can use `.env.example` as a template.

If you are going to use public network, make sure you include the right RPC provider for that network.

Make sure you include either `MNEMONIC` in your `.env` file.

#### 4. Setup Mock Contracts if needed

This block is optional because you can use actual Ragnarok and SecureLiquidDigitalChip contracts deployed on Sepolia network.

```shell
# deploy mock RagnarokMock contract for testing purposes
hh deploy --network sepolia --tags ragnarok-mock
# mint some tokens for testing purposes
# --recipient parameter is optional, if not provided, the token will be minted to the caller's address
# !!! only mint tokens with unique ids because new SevenSevenBit tokens will be minted with the same ids.
#  Transformation contract also assumes that all the existing Ragnarok tokens are minted with unique ids.
hh ragnarok-mock:mint --id 1 --amount 1 --network sepolia --recipient 0x747aa408Ce8ed36802656B064b2543004dCdF9D0
hh ragnarok-mock:mint --id 4 --amount 1 --network sepolia --recipient 0x747aa408Ce8ed36802656B064b2543004dCdF9D0
hh ragnarok-mock:mint --id 5 --amount 1 --network sepolia --recipient 0x747aa408Ce8ed36802656B064b2543004dCdF9D0

# deploy mock SecureLiquidDigitalChipMock contract for testing purposes
hh deploy --network sepolia --tags sld-chip-mock
# add yourself as a minter
hh sld-chip-mock:add-minter --network sepolia
# mint some tokens for testing purposes
hh sld-chip-mock:mint --network sepolia --amount 1 --id 1 --recipient 0x747aa408Ce8ed36802656B064b2543004dCdF9D0
hh sld-chip-mock:mint --network sepolia --amount 1 --id 2
```

#### 4. Deploy SevenSevenBit Contract

```shell
hh 77bit:deploy-with-proxy --network sepolia --uri http://162.243.160.210:8089/api/v1/contracts/77bit/metadata/
```

#### 5. Deploy RagnarokTransform Contract

```shell
# call this if you want to use already deployed Ragnarok and SecureLiquidDigitalChip contracts
# --initial77bit-tokens-owner-address is the address that has received all the SevenSevenBit tokens during the initial minting.
hh ragnarok-transform:deploy-with-proxy --network sepolia \
    --ragnarok-address 0x58d8869122b2dc1784601b14aa951ccf82d986fe

# call this if you want to use deployed RagnarokMock and SecureLiquidDigitalChipMock contracts
hh ragnarok-transform:deploy-with-proxy --network sepolia
```

#### 6. Add RagnarokTransform as a minter to SevenSevenBit contract
```shell
# replace with actual address from ./deployments
export TRANSFORM_CONTRACT_ADDRESS=0x721CCf8F397d887Fb28119D2434F9e6b951b4AaE

hh 77bit:add-minter --network sepolia --address $TRANSFORM_CONTRACT_ADDRESS
```

#### 7. Try Art Upgrade

```shell
# firstly user(owner of Ragnarok token) has to approve RagnarokTransform contract to spend his Ragnarok tokens
# !! this should be called on behalf of the actual owner of Ragnarok token (not the admin) - you can replace mnemonic in the .env file
hh ragnarok-mock:set-approval-for-all --approve true --network sepolia --operator $TRANSFORM_CONTRACT_ADDRESS

# now user can execute art-upgrade
hh ragnarok-mock:set-approval-for-all --approve true --network sepolia --operator $TRANSFORM_CONTRACT_ADDRESS
hh ragnarok-transform:art-upgrade --network sepolia --token-ids 2

# optionally verify new balances
hh 77bit:owner-of --network sepolia --token-id 1
hh 77bit:owner-of --network sepolia --token-id 2
hh ragnarok-mock:balance-of --network sepolia --token-id 1
hh ragnarok-mock:balance-of --network sepolia --token-id 2
hh ragnarok-mock:balance-of --network sepolia --token-id 3
```

#### 8. Try Re-Roll

```shell
# 1. Obtain SevenSevenBit and SecureLiquidDigitalChip token on the account, art-upgrade is required before re-roll

# replace with actual address from ./deployments
export TRANSFORM_CONTRACT_ADDRESS=0x721CCf8F397d887Fb28119D2434F9e6b951b4AaE
hh sld-chip-mock:set-approval-for-all --approve true --network sepolia --operator $TRANSFORM_CONTRACT_ADDRESS

# Re-Roll token (3 with chip 2) and (token 2 without chip)
hh ragnarok-transform:re-roll --network sepolia --token-ids 3,2 --chip-ids 2,0

# optionally verify new balances
# chip must have been transferred to the Transform contract
hh sld-chip-mock:balance-of --network sepolia --token-id 2
```

### For development

```shell
## run tests
npm run test

## run tests with coverage
npm run coverage

## format code
npm run format:check
npm run format:write

## lint
npm run lint:check
npm run lint:fix

## prettier solidity
npm run sol:format:check
npm run sol:format:write

## Solhint - Enforcing styles and security best practices
npm run solhint
```
