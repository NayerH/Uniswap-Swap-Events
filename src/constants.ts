import { createAddress } from "forta-agent-tools";

export const SWAP_EVENT : string = "event Swap(address indexed sender, address indexed recipient, int256 amount0, int256 amount1, uint160 sqrtPriceX96, uint128 liquidity, int24 tick)";

export const UNISWAP_FACTORY_ADDRESS : string = createAddress("0x1F98431c8aD98523631AE4a59f267346ea31F984");

type Pool = {
 sender : string,
 receiver : string,
 poolAddress : string,
 token0 : string,
 token1 : string,
 fee : number
}
export const UNISWAP_POOL_INFORMATION : Pool = {
  sender : createAddress("0xa69babef1ca67a37ffaf7a485dfff3382056e78c"),
  receiver : createAddress("0x56178a0d5f301baf6cf3e1cd53d9863437345bf9"),
  poolAddress : createAddress("0xC2e9F25Be6257c210d7Adf0D4Cd6E3E881ba25f8"),
  token0 : createAddress("0x6b175474e89094c44da98b954eedeac495271d0f"),
  token1 : createAddress("0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"),
  fee : 3000,
}

export const UNISWAP_POOL_ABI : string[] = [
  "function fee() external view returns(uint24)",
  "function token0() external view returns(address)",
  "function token1() external view returns(address)"
];

export const UNISWAP_FACTORY_ABI : string[] = ["function getPool(address arg1, address arg2, uint24 arg3) external view returns(address)"];
