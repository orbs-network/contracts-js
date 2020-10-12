/**
 * Copyright 2019 the orbs-ethereum-contracts authors
 * This file is part of the orbs-ethereum-contracts library in the Orbs project.
 *
 * This source code is licensed under the MIT license found in the LICENSE file in the root directory of this source tree.
 * The above notice should be included in all copies or substantial portions of the software.
 */

import Web3 from 'web3';
import { PromiEvent, TransactionReceipt } from 'web3-core';
import { AbiItem } from 'web3-utils';
import { IStakingService, IUnstakingStatus, StakingServiceEventCallback } from './IStakingService';
import {
  getUnsubscribePromise,
  ORBS_MAIN_NET_CONTRACT_ADDRESSES, TContractEventSubscribeFunction,
  TUnsubscribeFunction
} from "../..";
import StakingContractJson from "@orbs-network/orbs-ethereum-contracts-v2/build/contracts/StakingContract.json";
import { StakingContract } from "../../contracts/StakingContract";
import {ContractEventLog} from "../../contracts/types";

/**
 * It just so happens that all of the staking related events have the same signature.
 * DEV_NOTE : The real object will also have array accessors ("1", "2", "3") that match the named members.
 * DEV_NOTE : Currently amounts are strings, in the future should change to bigint)
 */
interface IStakingContractEventValues {
  stakeOwner: string;
  // TODO : O.L : Change this to bigint after web3 change
  amount: string; // Amount for the event
  // TODO : O.L : Change this to bigint after web3 change
  totalStakedAmount: string; // Total staked amount for given owner
}

const MAIN_NET_STAKING_ADDRESS = ORBS_MAIN_NET_CONTRACT_ADDRESSES.staking;

export class StakingService implements IStakingService {
  private readonly stakingContractAddress: string;
  private stakingContract: StakingContract;

  constructor(private web3: Web3, stakingContractAddress: string = MAIN_NET_STAKING_ADDRESS) {
    this.stakingContractAddress = stakingContractAddress;
    this.stakingContract = (new this.web3.eth.Contract(
        StakingContractJson.abi as AbiItem[],
        this.stakingContractAddress
    ) as any) as StakingContract;
  }

  // CONFIG //
  setFromAccount(address: string): void {
    this.stakingContract.options.from = address;
  }

  getStakingContractAddress() {
    return this.stakingContractAddress;
  }

  // WRITE //
  stake(amount: bigint): PromiEvent<TransactionReceipt> {
    return this.stakingContract.methods.stake(amount.toString()).send();
  }

  unstake(amount: bigint): PromiEvent<TransactionReceipt> {
    return this.stakingContract.methods.unstake(amount.toString()).send();
  }

  restake(): PromiEvent<TransactionReceipt> {
    return this.stakingContract.methods.restake().send();
  }

  withdraw(): PromiEvent<TransactionReceipt> {
    return this.stakingContract.methods.withdraw().send();
  }

  // READ //
  async readStakeBalanceOf(stakeOwner: string): Promise<bigint> {
    const stakedBalance = await this.stakingContract.methods.getStakeBalanceOf(stakeOwner).call();

    return BigInt(stakedBalance);
  }

  async readTotalStakedTokens(): Promise<bigint> {
    const totalStakedTokens = await this.stakingContract.methods.getTotalStakedTokens().call();
    return BigInt(totalStakedTokens);
  }

  async readUnstakeStatus(stakeOwner: string): Promise<IUnstakingStatus> {
    const result = await this.stakingContract.methods.getUnstakeStatus(stakeOwner).call();

    let cooldownAmountBigInt = BigInt(result.cooldownAmount);
    let cooldownEndTimeNumber = Number(result.cooldownEndTime);

    // DEV_NOTE : NaN means that the given stake owner has no "active" cooldown process.
    // DEV_NOTE : We have removed the check for "typeof cooldownAmountBigInt != 'bigint'" in order to support polyfills
    //            of Bigint.
    if (Number.isNaN(cooldownEndTimeNumber)) {
      cooldownAmountBigInt = BigInt(0);
      cooldownEndTimeNumber = 0;
    }

    return {
      cooldownAmount: cooldownAmountBigInt,
      cooldownEndTime: cooldownEndTimeNumber,
    };
  }

  // Events Subscriptions //
  public subscribeToStakedEvent(stakeOwner: string, callback: StakingServiceEventCallback): TUnsubscribeFunction {
    const eventSubscriptionFunction = this.stakingContract.events.Staked;
    return this.subscribeToStakingContractEvent(eventSubscriptionFunction, stakeOwner, callback);
  }

  public subscribeToUnstakedEvent(stakeOwner: string, callback: StakingServiceEventCallback): TUnsubscribeFunction {
    const eventSubscriptionFunction = this.stakingContract.events.Unstaked;
    return this.subscribeToStakingContractEvent(eventSubscriptionFunction, stakeOwner, callback);
  }

  public subscribeToRestakedEvent(stakeOwner: string, callback: StakingServiceEventCallback): TUnsubscribeFunction {
    const eventSubscriptionFunction = this.stakingContract.events.Restaked;
    return this.subscribeToStakingContractEvent(eventSubscriptionFunction, stakeOwner, callback);
  }

  public subscribeToWithdrewEvent(stakeOwner: string, callback: StakingServiceEventCallback): TUnsubscribeFunction {
    const eventSubscriptionFunction = this.stakingContract.events.Withdrew;
    return this.subscribeToStakingContractEvent(eventSubscriptionFunction, stakeOwner, callback);
  }

  /**
   * Dev Note : O.L : This function should be extracted and isolated for testing purpose.
   * Dev Note #2 : All the events of the 'Staking contract' have exactly the same signature.
   */
  private subscribeToStakingContractEvent<T extends ContractEventLog<IStakingContractEventValues>>(
    eventSubscriptionFunction: TContractEventSubscribeFunction<T>,
    stakeOwner: string,
    callback: StakingServiceEventCallback,
  ): TUnsubscribeFunction {
    const specificEventEmitter = eventSubscriptionFunction(
      {
        filter: {
          stakeOwner: [stakeOwner],
        },
      },
      (error: Error, event) => {
        if (error) {
          callback(error, BigInt(0), BigInt(0));
          return;
        }

        callback(null, BigInt(event.returnValues.amount), BigInt(event.returnValues.totalStakedAmount));
      },
    );

    // DEV_NOTE : O.L : This was taken directly from the old 'orbs-pos-data'.
    //                  it seems that the contracts generated types are using the nodejs 'EventEmitter' type.
    //                  we should check for inconsistencies.
    // TODO : O.L : Ensure this works properly
    // @ts-ignore
    return () => getUnsubscribePromise(specificEventEmitter);
  }
}
