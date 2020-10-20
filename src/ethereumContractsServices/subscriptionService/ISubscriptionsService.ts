export interface ISubscriptionsService {
  setFromAccount(defaultAccountAddress: string): void;
  readVcData(vcid: string): Promise<TReadVcDataResponse>;
  readVcIdFromHistory(blockNumber: number, ownerId: string): Promise<TVcGist>;
  readVcCreatedEvents(ownerId: string, startFromBlock?: number): Promise<TVcCreatedEvent[]>;
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

export type TVcCreatedEvent = {
  vcId: string,
}
