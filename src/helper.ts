import { ethers } from "ethers";
import { getEthersProvider } from "forta-agent";
import { createAddress } from "forta-agent-tools";
import { UNISWAP_FACTORY_ADDRESS, UNISWAP_POOL_ABI, UNISWAP_FACTORY_ABI } from "./constants";

type Pool = {
  token0 : string,
  token1 : string,
  fee : string,
  isValid : boolean
}

export async function checkPoolAddress(poolAddress : string) : Promise<Pool> {
  const ethersProvider = getEthersProvider();
  const poolContract = new ethers.Contract(poolAddress, UNISWAP_POOL_ABI, ethersProvider);

  let token0 : string;
  let token1 : string;
  let fee : string;
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

  const factoryContract = new ethers.Contract(UNISWAP_FACTORY_ADDRESS, UNISWAP_FACTORY_ABI, ethersProvider);

  let validPoolRight : string;
  let validPoolLeft : string;
  try {
    validPoolRight = await factoryContract.getPool(token0, token1, fee);
    validPoolLeft = await factoryContract.getPool(token1, token0, fee);
  } catch (e) {
    return {
      token0: "",
      token1: "",
      fee: "0",
      isValid: false
    };
  }

  const isValid = (poolAddress === createAddress(validPoolLeft)) && (poolAddress === createAddress(validPoolRight));
  return {token0, token1, fee, isValid};
}
