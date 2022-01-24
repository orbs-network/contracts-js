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
import {ORBS_MAIN_NET_CONTRACT_ADDRESSES} from "../mainnetAddresses";
import {IOrbsTokenService, OrbsAllowanceChangeCallback} from "./IOrbsTokenService";
import Erc20ContractJson from "@orbs-network/orbs-ethereum-contracts-v2/build/contracts/ERC20.json";
import { ERC20 } from "../../contracts/ERC20";
import {TUnsubscribeFunction} from "../contractsTypes/contractTypes";
import {getUnsubscribePromise} from '../../utils/erc20EventsUtils';

const MAIN_NET_ERC_TOKEN_ADDRESS = ORBS_MAIN_NET_CONTRACT_ADDRESSES.ercToken;

export class OrbsTokenService implements IOrbsTokenService {
  private erc20TokenContract: ERC20;

  constructor(private web3: Web3, erc20address: string = MAIN_NET_ERC_TOKEN_ADDRESS) {
    this.erc20TokenContract = (new this.web3.eth.Contract(
        Erc20ContractJson.abi as AbiItem[],
        erc20address
    ) as any) as ERC20;
  }

  // CONFIG //
  setFromAccount(address: string): void {
    this.erc20TokenContract.options.from = address;
  }

  // READ //
  async readBalance(address: string) : Promise<bigint> {
    const balance = await this.erc20TokenContract.methods.balanceOf(address);
    return BigInt(balance as any);
  }

  async readAllowance(ownerAddress: string, spenderAddress: string): Promise<bigint> {
    const allowanceStr: string = await this.erc20TokenContract.methods.allowance(ownerAddress, spenderAddress).call();
    return BigInt(allowanceStr);
  }

  // SUBSCRIPTIONS //
  subscribeToAllowanceChange(
    ownerAddress: string,
    spenderAddress: string,
    callback: OrbsAllowanceChangeCallback,
  ) : TUnsubscribeFunction {
    const specificEventEmitter = this.erc20TokenContract.events.Approval(
      {
        filter: {
          owner: [ownerAddress],
          spender: [spenderAddress],
        },
      },
      async (error: Error, event) => {
        if (error) {
          callback(error, BigInt(0));
          return;
        }

        const newAllowance = event.returnValues.value;
        callback(null, BigInt(newAllowance));
      },
    );

    // DEV_NOTE : O.L : This was taken directly from the old 'orbs-pos-data'.
    //                  it seems that the contracts generated types are using the nodejs 'EventEmitter' type.
    //                  we should check for inconsistencies.
    // TODO : O.L : Ensure this works properly
    // @ts-ignore
    return () => getUnsubscribePromise(specificEventEmitter);
  }

  // WRITE //
  approve(spenderAddress: string, amount: bigint): PromiEvent<TransactionReceipt> {
    return this.erc20TokenContract.methods.approve(spenderAddress, amount.toString()).send();
  }
}
