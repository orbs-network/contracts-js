import { EventData } from "web3-eth-contract";

export interface ISubscriptionsService {
  setFromAccount(defaultAccountAddress: string): void;
  readVcData(vcid: string): Promise<TReadVcDataResponse>;
  readVcIdFromHistory(blockNumber: number, ownerId: string): Promise<TVcGist>;
}

export type TVcGist = { vcId: string; owner: string };

export type TReadVcDataResponse = {
  name: string;
  tier: string;
  rate: string;
  expiresAt: string;
  genRefTime: string;
  owner: string;
  deploymentSubset: string;
  isCertified: boolean;
};
