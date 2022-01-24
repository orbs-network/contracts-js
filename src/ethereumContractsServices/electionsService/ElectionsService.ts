import { IElectionsService, IGetSettingsResult } from "./IElectionsService";
import { Elections } from "../../contracts/Elections";
import ElectionsContractJson from "@orbs-network/orbs-ethereum-contracts-v2/build/contracts/Elections.json";
import Web3 from "web3";
import { AbiItem } from "web3-utils";
import { ORBS_MAIN_NET_CONTRACT_ADDRESSES } from "../mainnetAddresses";

const MAIN_NET_COMMITTEE_CONTRACT_ADDRESS =
  ORBS_MAIN_NET_CONTRACT_ADDRESSES.electionsService;

export class ElectionsService implements IElectionsService {
  private contarct: Elections;

  constructor(
    private web3: Web3,
    address: string = MAIN_NET_COMMITTEE_CONTRACT_ADDRESS
  ) {
    this.contarct = new this.web3.eth.Contract(
      ElectionsContractJson.abi as AbiItem[],
      address
    ) as any as Elections;
  }

  public async getSettings(): Promise<IGetSettingsResult> {
    return this.contarct.methods.getSettings().call();
  }
}
