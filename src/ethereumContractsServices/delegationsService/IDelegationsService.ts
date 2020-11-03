import { PromiEvent, TransactionReceipt } from 'web3-core';

export interface IDelegationsService {
  setFromAccount(defaultAccountAddress: string): void;
  readVoidAddress(): Promise<string>
  readDelegation(forAddress: string): Promise<string>;
  readUncappedDelegatedStakeInFullOrbs(voidAddress?: string) : Promise<number>
  delegate(delegationTargetAddress: string): PromiEvent<TransactionReceipt>;

  /**
   * Note: Un-delegating is basically delegating to oneself.
   * @param selfAddress The address of the called
   */
  unDelegate(selfAddress: string): PromiEvent<TransactionReceipt>;
}
