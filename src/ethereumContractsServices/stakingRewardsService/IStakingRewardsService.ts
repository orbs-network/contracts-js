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
  readContractRewardsSettings: () => Promise<TRewardsContractSettings>;
  readDelegatorsCutPercentage: (address: string) => Promise<number>;
  readGuardianRewardsSettings: (
    address: string
  ) => Promise<TGuardianRewardsSettings>;
  setDelegatorsCutPercentage: (
    delegatorsCutPercentage: number
  ) => PromiEvent<TransactionReceipt>;
}
