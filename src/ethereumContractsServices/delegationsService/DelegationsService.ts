import { IDelegationsService } from './IDelegationsService';
import Web3 from 'web3';
import { AbiItem } from 'web3-utils';
import DelegationsContractJson from '@orbs-network/orbs-ethereum-contracts-v2/build/contracts/Delegations.json';
import { Delegations } from '../../contracts/Delegations';
import { PromiEvent, TransactionReceipt } from 'web3-core';
import {ORBS_MAIN_NET_CONTRACT_ADDRESSES} from "../mainnetAddresses";
import {fullOrbsFromWeiOrbs} from "../..";

const MAIN_NET_DELEGATIONS_CONTRACT_ADDRESS = ORBS_MAIN_NET_CONTRACT_ADDRESSES.delegationsService;

export class DelegationsService implements IDelegationsService {
  private delegationsContract: Delegations;

  constructor(private web3: Web3, delegationsContractAddress: string = MAIN_NET_DELEGATIONS_CONTRACT_ADDRESS) {
    this.delegationsContract = (new this.web3.eth.Contract(
      DelegationsContractJson.abi as AbiItem[],
      delegationsContractAddress,
    ) as any) as Delegations;
  }

  setFromAccount(defaultAccountAddress: string): void {
    this.delegationsContract.options.from = defaultAccountAddress;
  }

  readDelegation(fromAddress: string): Promise<string> {
    return this.delegationsContract.methods.getDelegation(fromAddress).call();
  }

  async readVoidAddress(): Promise<string> {
    return this.delegationsContract.methods.VOID_ADDR().call();
  }

  async readUncappedDelegatedStakeInFullOrbs(voidAddress?: string) : Promise<number> {
    let voidAddressToUse: string;

    if (voidAddress) {
      voidAddressToUse = voidAddress;
    } else {
      voidAddressToUse = await this.readVoidAddress();
    }

    const uncappedDelegatedStake = await this.delegationsContract.methods.uncappedDelegatedStake(voidAddressToUse).call();
    const uncappedDelegatedStakeInFullOrbs = fullOrbsFromWeiOrbs(uncappedDelegatedStake);

    return uncappedDelegatedStakeInFullOrbs;
  }

  delegate(delegationTargetAddress: string): PromiEvent<TransactionReceipt> {
    return this.delegationsContract.methods.delegate(delegationTargetAddress).send();
  }

  unDelegate(selfAddress: string): PromiEvent<TransactionReceipt> {
    return this.delegate(selfAddress);
  }
}
