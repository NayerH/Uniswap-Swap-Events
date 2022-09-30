import {
  FindingType,
  FindingSeverity,
  Finding,
  HandleTransaction,
  TransactionEvent,
  ethers,
  getEthersProvider,
} from "forta-agent";
import { TestTransactionEvent } from "forta-agent-tools/lib/test";
import { createAddress } from "forta-agent-tools";
import { SWAP_EVENT } from "./constants";
import { provideTransactionHandler } from "./agent";

describe("Uniswap Swap Detection Bot", () => {
  type Pool = {
    sender: string;
    receiver: string;
    poolAddress: string;
    token0: string;
    token1: string;
    fee: number;
  };
  const UNISWAP_POOL_1: Pool = {
    sender: createAddress("0x1"),
    receiver: createAddress("0x2"),
    poolAddress: createAddress("0xC2e9F25Be6257c210d7Adf0D4Cd6E3E881ba25f8"),
    token0: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
    token1: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    fee: 3000,
  };
  const UNISWAP_POOL_2: Pool = {
    sender: createAddress("0x3"),
    receiver: createAddress("0x4"),
    poolAddress: createAddress("0xcbcdf9626bc03e24f779434178a73a0b4bad62ed"),
    token0: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
    token1: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    fee: 3000,
  };
  const MOCK_PROVIDER = getEthersProvider();

  let handleTransaction: HandleTransaction;
  let mockTxEvent: TransactionEvent;

  beforeAll(() => {
    handleTransaction = provideTransactionHandler(MOCK_PROVIDER, SWAP_EVENT);
  });

  it("returns empty findings if transaction is not involved with a swap", async () => {
    mockTxEvent = new TestTransactionEvent().setFrom(UNISWAP_POOL_1.sender).setTo(UNISWAP_POOL_1.poolAddress);

    const findings = await handleTransaction(mockTxEvent);
    expect(findings).toStrictEqual([]);
  });

  it("returns empty findings if transaction involves a swap not related to a Uniswap pool", async () => {
    mockTxEvent = new TestTransactionEvent()
      .setFrom(UNISWAP_POOL_1.sender)
      .setTo(createAddress("0xa47D88B172bbA7E1ad9a1799Dd068F70f9aB7E6A"))
      .addEventLog(SWAP_EVENT, createAddress("0xa47D88B172bbA7E1ad9a1799Dd068F70f9aB7E6A"), [
        UNISWAP_POOL_1.sender,
        UNISWAP_POOL_1.receiver,
        "-6980258894621148086191",
        "5316577313196438022",
        "2183814749620062943734661703",
        "385569747097993539145356",
        "-71829",
      ]);

    const findings = await handleTransaction(mockTxEvent);
    expect(findings).toStrictEqual([]);
  });

  it("returns empty findings if transaction involves a swap not related to a Uniswap V3 pool", async () => {
    mockTxEvent = new TestTransactionEvent()
      .setFrom(UNISWAP_POOL_1.sender)
      .setTo(createAddress("0x65B9AD105B95290bcdE1Ed91F2f6688232ad5782"))
      .addEventLog(SWAP_EVENT, createAddress("0x65B9AD105B95290bcdE1Ed91F2f6688232ad5782"), [
        UNISWAP_POOL_1.sender,
        UNISWAP_POOL_1.receiver,
        "-6980258894621148086191",
        "5316577313196438022",
        "2183814749620062943734661703",
        "385569747097993539145356",
        "-71829",
      ]);

    const findings = await handleTransaction(mockTxEvent);
    expect(findings).toStrictEqual([]);
  });

  it("returns a finding if a transaction involves a swap related to a Uniswap pool", async () => {
    mockTxEvent = new TestTransactionEvent()
      .setFrom(UNISWAP_POOL_1.sender)
      .setTo(UNISWAP_POOL_1.poolAddress)
      .addEventLog(SWAP_EVENT, UNISWAP_POOL_1.poolAddress, [
        UNISWAP_POOL_1.sender,
        UNISWAP_POOL_1.receiver,
        "-6980258894621148086191",
        "5316577313196438022",
        "2183814749620062943734661703",
        "385569747097993539145356",
        "-71829",
      ]);

    const findings = await handleTransaction(mockTxEvent);
    expect(findings).toStrictEqual([
      Finding.fromObject({
        name: "Uniswap Swap",
        description: "Swap made using Uniswap V3",
        alertId: "UNISWAP-SWAP-1",
        severity: FindingSeverity.Info,
        type: FindingType.Info,
        protocol: "Uniswap",
        metadata: {
          pool: UNISWAP_POOL_1.poolAddress,
          sender: UNISWAP_POOL_1.sender,
          recipient: UNISWAP_POOL_1.receiver,
          token0: UNISWAP_POOL_1.token0,
          token1: UNISWAP_POOL_1.token1,
          amount0: "-6980258894621148086191",
          amount1: "5316577313196438022",
          fee: UNISWAP_POOL_1.fee.toString(),
        },
      }),
    ]);
  });

  it("returns multiple findings if more than one transaction involves a swap related to a Uniswap pool", async () => {
    mockTxEvent = new TestTransactionEvent()
      .setFrom(UNISWAP_POOL_1.sender)
      .setTo(UNISWAP_POOL_1.poolAddress)
      .addEventLog(SWAP_EVENT, UNISWAP_POOL_1.poolAddress, [
        UNISWAP_POOL_1.sender,
        UNISWAP_POOL_1.receiver,
        "-6980258894621148086191",
        "5316577313196438022",
        "2183814749620062943734661703",
        "385569747097993539145356",
        "-71829",
      ])
      .addEventLog(SWAP_EVENT, UNISWAP_POOL_2.poolAddress, [
        UNISWAP_POOL_2.sender,
        UNISWAP_POOL_2.receiver,
        "1638675",
        "-238219505036660516",
        "30253408291035598035977085895836424",
        "1919124489663096117",
        "257068",
      ]);

    const findings = await handleTransaction(mockTxEvent);
    expect(findings).toStrictEqual([
      Finding.fromObject({
        name: "Uniswap Swap",
        description: "Swap made using Uniswap V3",
        alertId: "UNISWAP-SWAP-1",
        severity: FindingSeverity.Info,
        type: FindingType.Info,
        protocol: "Uniswap",
        metadata: {
          pool: UNISWAP_POOL_1.poolAddress,
          sender: UNISWAP_POOL_1.sender,
          recipient: UNISWAP_POOL_1.receiver,
          token0: UNISWAP_POOL_1.token0,
          token1: UNISWAP_POOL_1.token1,
          amount0: "-6980258894621148086191",
          amount1: "5316577313196438022",
          fee: UNISWAP_POOL_1.fee.toString(),
        },
      }),
      Finding.fromObject({
        name: "Uniswap Swap",
        description: "Swap made using Uniswap V3",
        alertId: "UNISWAP-SWAP-1",
        severity: FindingSeverity.Info,
        type: FindingType.Info,
        protocol: "Uniswap",
        metadata: {
          pool: UNISWAP_POOL_2.poolAddress,
          sender: UNISWAP_POOL_2.sender,
          recipient: UNISWAP_POOL_2.receiver,
          token0: UNISWAP_POOL_2.token0,
          token1: UNISWAP_POOL_2.token1,
          amount0: "1638675",
          amount1: "-238219505036660516",
          fee: UNISWAP_POOL_2.fee.toString(),
        },
      }),
    ]);
  });
});
