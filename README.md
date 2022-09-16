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

- [0x5ada1b0ecf6f79e05bf28744f6928d625e18697658b5ab5e93b163e8c7c44f59](https://etherscan.io/tx/0x5ada1b0ecf6f79e05bf28744f6928d625e18697658b5ab5e93b163e8c7c44f59#eventlog)
