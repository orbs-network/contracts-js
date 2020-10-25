import { PromiEvent, TransactionReceipt } from "web3-core";

export type TRewardsContractSettings = {
  maxDelegatorsStakingRewardsPercent: number;
  defaultDelegatorsStakingRewardsPercent: number;
};

export type TGuardianRewardsSettings = {
  delegatorsStakingRewardsPercent: number;
  isUsingDefaultRewardsPercent: boolean;
};

export interface IStakingRewardsService {
  setFromAccount: (address: string) => void;
  // Setting reading
  readContractRewardsSettings: () => Promise<TRewardsContractSettings>;
  readGuardianRewardsSettings: (
    address: string
  ) => Promise<TGuardianRewardsSettings>;

  // Reading
  readDelegatorsCutPercentage: (address: string) => Promise<number>;
  /**
   * Reads the balance in full orbs
   */
  readRewardsBalanceFullOrbs: (address: string) => Promise<number>;
  /**
   * Reads the amount of claimed rewards in full orbs
   */
  readClaimedRewardsFullOrbs: (address: string) => Promise<number>;

  estimateFutureRewardsFullOrbs(address: string, durationInSeconds: number) : Promise<number>;

  // Writing
  setDelegatorsCutPercentage: (
    delegatorsCutPercentage: number
  ) => PromiEvent<TransactionReceipt>;

  // Actions
  claimRewards: (address: string) => PromiEvent<TransactionReceipt>;
}
