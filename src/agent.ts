import {
  Finding,
  HandleTransaction,
  TransactionEvent,
  FindingSeverity,
  FindingType,
} from "forta-agent";
import { createAddress } from "forta-agent-tools";
import {SWAP_EVENT} from './constants';
import {checkPoolAddress} from "./helper";

export function provideTransactionHandler(swapEventSignature : string): HandleTransaction {
  return async (txEvent: TransactionEvent): Promise<Finding[]> => {
    const findings: Finding[] = [];

    const swapEvents = txEvent.filterLog(swapEventSignature);
    swapEvents.forEach((swapEvent) => {
      const { sender, recipient, amount0, amount1 } = swapEvent.args;
      const { token0, token1, fee, isValid } = checkPoolAddress(createAddress(swapEvent.address));
      if(!isValid) return;

      findings.push(
        Finding.fromObject({
          name: "Uniswap Swap",
          description: "Swap made using Uniswap V3",
          alertId: "UNISWAP-SWAP-1",
          severity: FindingSeverity.Info,
          type: FindingType.Info,
          protocol: "ethereum",
          metadata: {
            pool: createAddress(swapEvent.address),
            sender: createAddress(sender),
            recipient: createAddress(recipient),
            token0: createAddress(token0),
            token1: createAddress(token1),
            amount0,
            amount1,
            fee
          },
        })
      );

    });

    return findings;
  };
}

export default {
  handleTransaction : provideTransactionHandler(SWAP_EVENT),
};
