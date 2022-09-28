import { ethers } from "ethers";
import { getEthersProvider } from "forta-agent";
import { createAddress } from "forta-agent-tools";
import { UNISWAP_FACTORY_ADDRESS, UNISWAP_POOL_ABI, INIT_CODE } from "./constants";

type Pool = {
  token0: string,
  token1: string,
  fee: string,
  isValid: boolean
}

export async function checkPoolAddress(poolAddress: string): Promise<Pool> {
  const ethersProvider = getEthersProvider();
  const poolContract = new ethers.Contract(poolAddress, UNISWAP_POOL_ABI, ethersProvider);

  let token0: string;
  let token1: string;
  let fee: string;
  try {
    token0 = await poolContract.token0();
    token1 = await poolContract.token1();
    fee = await poolContract.fee();
  } catch (e) {
    return {
      token0: "",
      token1: "",
      fee: "0",
      isValid: false
    };
  }

  const salt = ethers.utils.keccak256(ethers.utils.defaultAbiCoder.encode(["address", "address", "uint24"], [token0, token1, fee]))
  const expectedAddress = ethers.utils.getCreate2Address(UNISWAP_FACTORY_ADDRESS, salt, INIT_CODE);
  const isValid = (poolAddress === createAddress(expectedAddress));

  return { token0, token1, fee, isValid };
}
