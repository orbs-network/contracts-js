import { PromiEvent, TransactionReceipt } from 'web3-core';

export interface IDelegationsService {
  setFromAccount(defaultAccountAddress: string): void;
  readVoidAddress(): Promise<string>
  readDelegation(forAddress: string): Promise<string>;
  readUncappedDelegatedStakeInFullOrbs() : Promise<number>
  delegate(delegationTargetAddress: string): PromiEvent<TransactionReceipt>;
}
