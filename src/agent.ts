import {
  Finding,
  HandleTransaction,
  TransactionEvent,
  FindingSeverity,
  FindingType,
  ethers,
  getEthersProvider,
} from "forta-agent";
import { SWAP_EVENT } from "./constants";
import { checkPoolAddress } from "./helper";

export function provideTransactionHandler(
  provider: ethers.providers.Provider,
  swapEventSignature: string
): HandleTransaction {
  return async (txEvent: TransactionEvent): Promise<Finding[]> => {
    const findings: Finding[] = [];

    const swapEvents = txEvent.filterLog(swapEventSignature);
    for (const swapEvent of swapEvents) {
      const { sender, recipient, amount0, amount1 } = swapEvent.args;
      const { token0, token1, fee, isValid } = await checkPoolAddress(provider, swapEvent.address);
      if (isValid) {
        findings.push(
          Finding.fromObject({
            name: "Uniswap Swap",
            description: "Swap made using Uniswap V3",
            alertId: "UNISWAP-SWAP-1",
            severity: FindingSeverity.Info,
            type: FindingType.Info,
            protocol: "Uniswap",
            metadata: {
              pool: swapEvent.address,
              sender: sender,
              recipient: recipient,
              token0: token0,
              token1: token1,
              amount0: amount0.toString(),
              amount1: amount1.toString(),
              fee: fee.toString(),
            },
          })
        );
      }
    }
    return findings;
  };
}

export default {
  handleTransaction: provideTransactionHandler(getEthersProvider(), SWAP_EVENT),
};
