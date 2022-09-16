import { FindingType, FindingSeverity, Finding, HandleTransaction, TransactionEvent } from "forta-agent";
import { TestTransactionEvent } from "forta-agent-tools/lib/test";
import { createAddress } from "forta-agent-tools";
import { Interface } from "ethers/lib/utils";
import { SWAP_EVENT, UNISWAP_FACTORY_ADDRESS, DEPLOYER_ADDRESS, RECEIVER_ADDRESS, UNISWAP_POOL_ABI, UNISWAP_FACTORY_ABI } from './constants';
import { checkPoolAddress } from "./helper";
import agent from "./agent";

describe("Uniswap Swap Detection Bot", () => {
  let handleTransaction: HandleTransaction = agent.handleTransaction;
  // let functionABI = new Interface([BOT_CREATE_FUNCTION_SIGNATURE]).getFunction("createAgent");
  let mockTxEvent : TransactionEvent;

  it("returns empty findings if transaction is not involved with a swap", async () => {
    mockTxEvent = new TestTransactionEvent().setFrom(DEPLOYER_ADDRESS).setTo(RECEIVER_ADDRESS);

    const findings = await handleTransaction(mockTxEvent);
    expect(findings).toStrictEqual([]);
  });

  it("returns empty findings if transaction involves a swap not related to a Uniswap pool", async () => {
    mockTxEvent = new TestTransactionEvent()
      .setFrom(DEPLOYER_ADDRESS)
      .setTo(RECEIVER_ADDRESS)
      .addTraces({
        function: functionABI,
        to: PROXY_CONTRACT_ADDRESS,
        arguments: [
          123456,
          createAddress("0xa47D88B172bbA7E1ad9a1799Dd068F70f9aB7E6A"),
          "QmWRqhLG3xye6zuthLFS56aCoQHLE2Q6",
          [137],
        ]
      });


    const findings = await handleTransaction(mockTxEvent);
    expect(findings).toStrictEqual([]);
  });

  it("returns empty findings if non-swap transaction is related to a Uniswap pool", async () => {
    mockTxEvent = new TestTransactionEvent()
      .setFrom(DEPLOYER_ADDRESS)
      .setTo(RECEIVER_ADDRESS)
      .addTraces({
        function: functionABI,
        to: PROXY_CONTRACT_ADDRESS,
        arguments: [
          123456,
          createAddress("0xa47D88B172bbA7E1ad9a1799Dd068F70f9aB7E6A"),
          "QmWRqhLG3xye6zuthLFS56aCoQHLE2Q6",
          [137],
        ]
      });


    const findings = await handleTransaction(mockTxEvent);
    expect(findings).toStrictEqual([]);
  });

  it("returns non-empty findings if transaction involves a swap related to a Uniswap pool", async () => {
    mockTxEvent = new TestTransactionEvent()
      .setFrom(NETHERMIND_DEPLOYER_ADDRESS)
      .setTo(PROXY_CONTRACT_ADDRESS)
      .addTraces({
        function: functionABI,
        to: PROXY_CONTRACT_ADDRESS,
        arguments: [
          123456,
          NETHERMIND_DEPLOYER_ADDRESS,
          "QmWRqhLG3xye6zuthLFS56aCoQHLE2Q6",
          [137],
        ]
      });


    const findings = await handleTransaction(mockTxEvent);
    expect(findings).toStrictEqual([Finding.fromObject({
      name: "Bot Deployment",
      description: "A bot was deployed by Nethermind's Forta deployer address",
      alertId: "BOT-1",
      severity: FindingSeverity.Info,
      type: FindingType.Info,
      protocol: "polygon",
      metadata: {
        agentId : "123456",
        metadata : "QmWRqhLG3xye6zuthLFS56aCoQHLE2Q6",
      },
    })]);
  });

});
