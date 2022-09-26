import { FindingType, FindingSeverity, Finding, HandleTransaction, TransactionEvent } from "forta-agent";
import { TestTransactionEvent } from "forta-agent-tools/lib/test";
import { createAddress } from "forta-agent-tools";
import { SWAP_EVENT } from './constants';
import bot from "./agent";

describe("Uniswap Swap Detection Bot", () => {
  type Pool = {
   sender : string,
   receiver : string,
   poolAddress : string,
   token0 : string,
   token1 : string,
   fee : number
  }
  const UNISWAP_POOL_INFORMATION : Pool = {
    sender : createAddress("0x1"),
    receiver : createAddress("0x2"),
    poolAddress : createAddress("0xC2e9F25Be6257c210d7Adf0D4Cd6E3E881ba25f8"),
    token0 : createAddress("0x6b175474e89094c44da98b954eedeac495271d0f"),
    token1 : createAddress("0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"),
    fee : 3000,
  }
  let handleTransaction: HandleTransaction;
  let mockTxEvent : TransactionEvent;

  beforeAll(() => {
    handleTransaction = bot.handleTransaction;
  });

  it("returns empty findings if transaction is not involved with a swap", async () => {
    mockTxEvent = new TestTransactionEvent().setFrom(UNISWAP_POOL_INFORMATION.sender).setTo(UNISWAP_POOL_INFORMATION.poolAddress);

    const findings = await handleTransaction(mockTxEvent);
    expect(findings).toStrictEqual([]);
  });

  it("returns empty findings if transaction involves a swap not related to a Uniswap pool", async () => {
    mockTxEvent = new TestTransactionEvent()
      .setFrom(UNISWAP_POOL_INFORMATION.sender)
      .setTo(createAddress("0xa47D88B172bbA7E1ad9a1799Dd068F70f9aB7E6A"))
      .addEventLog(
        SWAP_EVENT,
        createAddress("0xa47D88B172bbA7E1ad9a1799Dd068F70f9aB7E6A"),
        [
          UNISWAP_POOL_INFORMATION.sender,
          UNISWAP_POOL_INFORMATION.receiver,
          "-6980258894621148086191",
          "5316577313196438022",
          "2183814749620062943734661703",
          "385569747097993539145356",
          "-71829",
        ]
      );

    const findings = await handleTransaction(mockTxEvent);
    expect(findings).toStrictEqual([]);
  });

  it("returns empty findings if transaction involves a swap not related to a Uniswap V3 pool", async () => {
    mockTxEvent = new TestTransactionEvent()
      .setFrom(UNISWAP_POOL_INFORMATION.sender)
      .setTo(createAddress("0x65B9AD105B95290bcdE1Ed91F2f6688232ad5782"))
      .addEventLog(
        SWAP_EVENT,
        createAddress("0x65B9AD105B95290bcdE1Ed91F2f6688232ad5782"),
        [
          UNISWAP_POOL_INFORMATION.sender,
          UNISWAP_POOL_INFORMATION.receiver,
          "-6980258894621148086191",
          "5316577313196438022",
          "2183814749620062943734661703",
          "385569747097993539145356",
          "-71829",
        ]
      );

    const findings = await handleTransaction(mockTxEvent);
    expect(findings).toStrictEqual([]);
  });

  it("returns non-empty findings if transaction involves a swap related to a Uniswap pool", async () => {
    mockTxEvent = new TestTransactionEvent()
      .setFrom(UNISWAP_POOL_INFORMATION.sender)
      .setTo(UNISWAP_POOL_INFORMATION.poolAddress)
      .addEventLog(
        SWAP_EVENT,
        UNISWAP_POOL_INFORMATION.poolAddress,
        [
          UNISWAP_POOL_INFORMATION.sender,
          UNISWAP_POOL_INFORMATION.receiver,
          "-6980258894621148086191",
          "5316577313196438022",
          "2183814749620062943734661703",
          "385569747097993539145356",
          "-71829",
        ]
      );

    const findings = await handleTransaction(mockTxEvent);
    expect(findings).toStrictEqual([Finding.fromObject({
      name: "Uniswap Swap",
      description: "Swap made using Uniswap V3",
      alertId: "UNISWAP-SWAP-1",
      severity: FindingSeverity.Info,
      type: FindingType.Info,
      protocol: "ethereum",
      metadata: {
        pool: UNISWAP_POOL_INFORMATION.poolAddress,
        sender: UNISWAP_POOL_INFORMATION.sender,
        recipient: UNISWAP_POOL_INFORMATION.receiver,
        token0: UNISWAP_POOL_INFORMATION.token0,
        token1: UNISWAP_POOL_INFORMATION.token1,
        amount0: "-6980258894621148086191",
        amount1: "5316577313196438022",
        fee: UNISWAP_POOL_INFORMATION.fee.toString(),
      },
    })]);
  });

});
