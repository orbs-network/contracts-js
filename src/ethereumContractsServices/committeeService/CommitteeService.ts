import { ICommitteeService } from './ICommitteeService';
import { Committee } from '../../contracts/Committee';
import CommitteeContractJson from '@orbs-network/orbs-ethereum-contracts-v2/build/contracts/Committee.json';
import Web3 from 'web3';
import { AbiItem } from 'web3-utils';
import {ORBS_MAIN_NET_CONTRACT_ADDRESSES} from "../mainnetAddresses";

const MAIN_NET_COMMITTEE_CONTRACT_ADDRESS = ORBS_MAIN_NET_CONTRACT_ADDRESSES.committeeService;

export class CommitteeService implements ICommitteeService {
  private committeeContract: Committee;

  constructor(private web3: Web3, delegationsContractAddress: string = MAIN_NET_COMMITTEE_CONTRACT_ADDRESS) {
    this.committeeContract = (new this.web3.eth.Contract(
      CommitteeContractJson.abi as AbiItem[],
      delegationsContractAddress,
    ) as any) as Committee;
  }
}
