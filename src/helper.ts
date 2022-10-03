import { ethers } from "ethers";
import { createAddress } from "forta-agent-tools";
import LRUCache from "lru-cache";
import { UNISWAP_FACTORY_ADDRESS, UNISWAP_POOL_ABI, INIT_CODE } from "./constants";

type Pool = {
  token0: string;
  token1: string;
  fee: string;
  isValid: boolean;
};

let cache: LRUCache<string, string[]> = new LRUCache<string, string[]>({ max: 1500 });

export async function checkPoolAddress(
  provider: ethers.providers.Provider,
  poolAddress: string,
  blockNumber: number
): Promise<Pool> {
  const poolDetails = cache.get(poolAddress);
  if (poolDetails !== undefined) {
    return {
      token0: poolDetails[0],
      token1: poolDetails[1],
      fee: poolDetails[2],
      isValid: true,
    };
  }

  const poolContract = new ethers.Contract(poolAddress, UNISWAP_POOL_ABI, provider);

  let token0: string;
  let token1: string;
  let fee: string;
  try {
    token0 = await poolContract.token0({ blockTag: blockNumber });
    token1 = await poolContract.token1({ blockTag: blockNumber });
    fee = await poolContract.fee({ blockTag: blockNumber });
  } catch (e) {
    return {
      token0: "",
      token1: "",
      fee: "0",
      isValid: false,
    };
  }

  const salt = ethers.utils.keccak256(
    ethers.utils.defaultAbiCoder.encode(["address", "address", "uint24"], [token0, token1, fee])
  );
  const expectedAddress: string = ethers.utils.getCreate2Address(UNISWAP_FACTORY_ADDRESS, salt, INIT_CODE);
  const isValid: boolean = poolAddress === createAddress(expectedAddress);

  if (isValid) {
    cache.set(poolAddress, [token0, token1, fee]);
  }
  return { token0, token1, fee, isValid };
}
