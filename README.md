# Uniswap Swap Events Bot

## Description

This bot detects Swaps occuring on Uniswap V3

## Supported Chains

- Ethereum

## Alerts

- UNISWAP-SWAP-1
  - Fired when a transaction is sent to complete a swap between currencies on Uniswap V3
  - Severity is always set to "info"
  - Type is always set to "info"
  - Metadata
    - `pool`: address of the pool involved in the `Swap`
    - `sender`: address of the sender of the funds in the `Swap`
    - `recipient`: address of the account that received the funds from the `Swap`
    - `token0`: address of the first token of the Uniswap Pool
    - `token1`: address of the second token of the Uniswap Pool
    - `amount0`: amount of `token0` involved in the `Swap`
    - `amount1`: amount of `token1` involved in the `Swap`
    - `fee`:  the pool's fee

## Test Data

The agent behaviour can be verified with the following transactions:

- [0xddac81d0a57f90708c85eb8041b5cd9f17f91ca1269741dffa911fdf6c816f9b](https://etherscan.io/tx/0xddac81d0a57f90708c85eb8041b5cd9f17f91ca1269741dffa911fdf6c816f9b#eventlog)
