import {
  ISubscriptionsService,
  TReadVcDataResponse,
  TVcGist,
} from "./ISubscriptionsService";
import Web3 from "web3";
import SubscriptionContractJson from "@orbs-network/orbs-ethereum-contracts-v2/build/contracts/Subscriptions.json";
import { AbiItem } from "web3-utils";
import {Subscriptions, VcCreated} from "../../contracts/Subscriptions";
import {ORBS_MAIN_NET_CONTRACT_ADDRESSES} from "../mainnetAddresses";
import {PastEventOptions} from "web3-eth-contract";

const MAIN_NET_SUBSCRIPTION_CONTRACT_ADDRESS = ORBS_MAIN_NET_CONTRACT_ADDRESSES.subscriptionsContract;

export class SubscriptionsService implements ISubscriptionsService {
  private subscriptionsContract: Subscriptions;

  constructor(
    private web3: Web3,
    subscriptionsContractAddress: string = MAIN_NET_SUBSCRIPTION_CONTRACT_ADDRESS
  ) {
    this.subscriptionsContract = (new this.web3.eth.Contract(
      SubscriptionContractJson.abi as AbiItem[],
      subscriptionsContractAddress
    ) as any) as Subscriptions;
  }

  setFromAccount(defaultAccountAddress: string): void {
    this.subscriptionsContract.options.from = defaultAccountAddress;
  }

  public async readVcData(vcid: string): Promise<TReadVcDataResponse> {
    const rawResponse = await this.subscriptionsContract.methods
      .getVcData(vcid)
      .call();

    const response: TReadVcDataResponse = rawResponse;

    return response;
  }

  public async readVcIdFromHistory(
    blockNumber: number,
    ownerId: string
  ): Promise<TVcGist> {
    const events: VcCreated[] = (await this.subscriptionsContract.getPastEvents("VcCreated", {
      address: ownerId,
      fromBlock: blockNumber,
      toBlock: blockNumber,
    }) as any) as VcCreated[];

    // DEV_NOTE : O.L : There should be only one
    const event = events[0];
    const { vcId } = event.returnValues;

    return {
      owner: ownerId,
      vcId,
    };
  }

  public async readVcCreatedEvents(ownerId: string, startFromBlock?: number): Promise<VcCreated[]> {
    const pastEventOptions : PastEventOptions = {
      address: ownerId,
    };

    if (startFromBlock !== undefined) {
      pastEventOptions.fromBlock = startFromBlock;
    }

    const events: VcCreated[] = (await this.subscriptionsContract.getPastEvents('VcCreated', pastEventOptions) as any) as VcCreated[];

    return events;
  }
}
