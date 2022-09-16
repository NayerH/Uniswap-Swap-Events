import { createAddress } from "forta-agent-tools";

export const SWAP_EVENT : string = "event Swap(address indexed sender, address indexed recipient, int256 amount0, int256 amount1, uint160 sqrtPriceX96, uint128 liquidity, int24 tick)";

export const UNISWAP_FACTORY_ADDRESS : string = createAddress("0x1F98431c8aD98523631AE4a59f267346ea31F984");
export const DEPLOYER_ADDRESS : string = createAddress("0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45");
export const RECEIVER_ADDRESS : string = createAddress("0x57119c723fd2ac41c8eb256892178b46b979424e");

export const UNISWAP_POOL_ABI : string[] = [
  "function fee() external view returns(uint24)",
  "function token0() external view returns(address)",
  "function token1() external view returns(address)"
];

export const UNISWAP_FACTORY_ABI : string = "function getPool(address arg1, address arg2, uint arg3) external view returns(address)";
