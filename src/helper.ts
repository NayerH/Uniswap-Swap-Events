import { ethers } from "ethers";
import { getEthersProvider } from "forta-agent";
import { UNISWAP_FACTORY_ADDRESS, UNISWAP_POOL_ABI, UNISWAP_FACTORY_ABI } from "./constants";

export function checkPoolAddress(poolAddress : string) : [string, string, number, bool] => {
  const ethersProvider = getEthersProvider();
  const poolContract = new ethers.Contract(poolAddress, UNISWAP_POOL_ABI, ethersProvider);

  let token0 : string;
  let token1 : string;
  let fee : any;
  try {
    token0 = await poolContract.token0();
    token1 = await poolContract.token1();
    fee = await poolContract.fee();
  } catch (e) {
    return false;
  }

  const factoryContract = new ethers.Contract(UNISWAP_FACTORY_ADDRESS, UNISWAP_FACTORY_ABI, ethersProvider);

  let validPoolRight : string;
  let validPoolLeft : string;
  try {
    validPoolRight = await factoryContract.getPool(token0, token1, fee);
    validPoolLeft = await factoryContract.getPool(token1, token0, fee);
  } catch (e) {
    return false;
  }
  const isValid = (poolAddress === validPoolLeft ? (poolAddress === validPoolRight) : false);

  return [token0, token1, fee, isValid];
}
