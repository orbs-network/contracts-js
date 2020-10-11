import { PromiEvent, TransactionReceipt } from "web3-core";

export interface IMonthlySubscriptionPlanService {
  contractAddress: string;

  setFromAccount(defaultAccountAddress: string): void;

  createANewVC(
    vcSubscriptionPayload: TVirtualChainSubscriptionPayload
  ): PromiEvent<TransactionReceipt>;

  extendSubscription(
    virtualChainSubscriptionExtensionPayload: TVirtualChainSubscriptionExtensionPayload
  ): PromiEvent<TransactionReceipt>;

  // Contract instance specific data
  readTier(): Promise<string>;
  readMonthlyRateInFullOrbs(): Promise<number>;
}

export type TVirtualChainSubscriptionPayload = {
  name: string;
  amountInFullOrbs: number;
  isCertified: boolean;
  deploymentSubset: string;
};

export type TVirtualChainSubscriptionExtensionPayload = {
  vcId: string;
  amountInFullOrbs: number;
};
