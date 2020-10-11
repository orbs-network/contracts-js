import {
  ISubscriptionsService,
  TReadVcDataResponse,
  TVcGist,
} from "./ISubscriptionsService";
import Web3 from "web3";
import SubscriptionContractJson from "@orbs-network/orbs-ethereum-contracts-v2/build/contracts/Subscriptions.json";
import { AbiItem } from "web3-utils";
import { Subscriptions } from "../../contracts/Subscriptions";

const MAIN_NET_SUBSCRIPTION_CONTRACT_ADDRESS =
  "0x3b2c72d0d5fc8a7346091f449487cd0a7f0954d6";

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
    const events = await this.subscriptionsContract.getPastEvents("VcCreated", {
      address: ownerId,
      fromBlock: blockNumber,
      toBlock: blockNumber,
    });

    // DEV_NOTE : O.L : There should be only one
    const event = events[0];
    const { owner, vcid } = event.returnValues;

    return {
      owner,
      vcId: vcid,
    };
  }
}
