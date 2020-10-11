import {
  IStakingRewardsService,
  TGuardianRewardsSettings,
  TRewardsContractSettings,
} from "./IStakingRewardsService";
import { PromiEvent, TransactionReceipt } from "web3-core";
import Web3 from "web3";
import { AbiItem } from "web3-utils";
import StakingRewardsContractJson from "@orbs-network/orbs-ethereum-contracts-v2/build/contracts/StakingRewards.json";
import { StakingRewards } from "../../contracts/StakingRewards";
import {ORBS_MAIN_NET_CONTRACT_ADDRESSES} from "../mainnetAddresses";

// DEV_NOTE : The value is between 0-100% with precision of 0.001,
//            The value is save as an integer in the contract, 0-100,000.
//            So we will need to divide/multiply when reading/writing.
const DELEGATORS_PERCENTAGE_FACTOR = 1_000;

const MAIN_NET_STAKING_REWARDS_CONTRACT_ADDRESS = ORBS_MAIN_NET_CONTRACT_ADDRESSES.stakingRewardsContract;

export class StakingRewardsService implements IStakingRewardsService {
  private stakingRewardsContract: StakingRewards;

  constructor(
    private web3: Web3,
    rewardsContractAddress: string = MAIN_NET_STAKING_REWARDS_CONTRACT_ADDRESS
  ) {
    this.stakingRewardsContract = (new this.web3.eth.Contract(
      StakingRewardsContractJson.abi as AbiItem[],
      rewardsContractAddress
    ) as any) as StakingRewards;
  }

  setFromAccount(address: string): void {
    this.stakingRewardsContract.options.from = address;
  }

  public async readContractRewardsSettings(): Promise<
    TRewardsContractSettings
  > {
    const settings = await this.stakingRewardsContract.methods.getSettings().call();

    const processedSettings: TRewardsContractSettings = {
      defaultDelegatorsStakingRewardsPercent: percentageFromMillies(
        parseInt(settings.defaultDelegatorsStakingRewardsPercentMille)
      ),
      maxDelegatorsStakingRewardsPercent: percentageFromMillies(
        parseInt(settings.maxDelegatorsStakingRewardsPercentMille)
      ),
    };

    return processedSettings;
  }

  public async readGuardianRewardsSettings(
    address: string
  ): Promise<TGuardianRewardsSettings> {
    const rawGuardianRewardsSettings = await this.stakingRewardsContract.methods
      .guardiansRewardSettings(address)
      .call();

    // const rawGuardianRewardsSettings = {};

    const guardianRewardsSettings: TGuardianRewardsSettings = {
      delegatorsStakingRewardsPercent: percentageFromMillies(
        parseInt(
          rawGuardianRewardsSettings.delegatorsStakingRewardsPercentMille
        )
      ),
      isUsingDefaultRewardsPercent: !rawGuardianRewardsSettings.overrideDefault,
    };

    return guardianRewardsSettings;
  }

  public async readDelegatorsCutPercentage(address: string): Promise<number> {
    const cutPercentageInMillies = await this.stakingRewardsContract.methods
      .getGuardianDelegatorsStakingRewardsPercentMille(address)
      .call();

    const cutPercentage = percentageFromMillies(
      parseInt(cutPercentageInMillies)
    );

    return cutPercentage;
  }

  public setDelegatorsCutPercentage(
    delegatorsCutPercentage: number
  ): PromiEvent<TransactionReceipt> {
    const delegatorsCutInMillies = milliesFromPercentage(
      delegatorsCutPercentage
    );

    return this.stakingRewardsContract.methods
      .setGuardianDelegatorsStakingRewardsPercentMille(delegatorsCutInMillies)
      .send();
  }
}

const milliesFromPercentage = (percentage: number) =>
  percentage * DELEGATORS_PERCENTAGE_FACTOR;
const percentageFromMillies = (millies: number) =>
  millies / DELEGATORS_PERCENTAGE_FACTOR;
