import Web3 from "web3";
import { AbiItem } from "web3-utils";
import GuardiansRegistrationContractJson from "@orbs-network/orbs-ethereum-contracts-v2/build/contracts/GuardiansRegistration.json";
import {
  IGuardiansService,
  TGuardianInfoResponse,
  TGuardianRegistrationPayload,
  TGuardianUpdatePayload,
} from "./IGuardiansService";
import { GuardiansRegistration } from "../../contracts/GuardiansRegistration";
import { PromiEvent, TransactionReceipt } from "web3-core";
import {
  GUARDIANS_SERVICE_CONSTANTS
} from "./GuardiansServiceConstants";
import { ipv4ToHex } from "../../utils/ipHexConversionUtils";
import {ORBS_MAIN_NET_CONTRACT_ADDRESSES} from "../mainnetAddresses";

const MAIN_NET_GUARDIANS_REGISTRATION_ADDRESS = ORBS_MAIN_NET_CONTRACT_ADDRESSES.guardiansContract;

export class GuardiansService implements IGuardiansService {
  private guardiansRegistrationContract: GuardiansRegistration;

  constructor(
    private web3: Web3,
    guardiansRegistrationAddress: string = MAIN_NET_GUARDIANS_REGISTRATION_ADDRESS
  ) {
    this.guardiansRegistrationContract = (new this.web3.eth.Contract(
      GuardiansRegistrationContractJson.abi as AbiItem[],
      guardiansRegistrationAddress
    ) as any) as GuardiansRegistration;
  }

  setFromAccount(address: string): void {
    this.guardiansRegistrationContract.options.from = address;
  }

  public async isRegisteredGuardian(address: string): Promise<boolean> {
    return this.guardiansRegistrationContract.methods
      .isRegistered(address)
      .call();
  }

  public async readGuardianInfo(
    address: string
  ): Promise<TGuardianInfoResponse> {
    const rawResponse = await this.guardiansRegistrationContract.methods
      .getGuardianData(address)
      .call();

    const {
      registrationTime,
      orbsAddr,
      name,
      lastUpdateTime,
      ip,
      website,
    } = rawResponse;

    const guardianInfoResponse: TGuardianInfoResponse = {
      // contact,
      ip,
      lastUpdateTime: parseInt(lastUpdateTime),
      name,
      orbsAddr,
      registrationTime: parseInt(registrationTime),
      website,
    };

    return guardianInfoResponse;
  }

  public async readGuardianDistributionFrequencyInSeconds(
    address: string
  ): Promise<number> {
    const rewardsFrequency = await this.guardiansRegistrationContract.methods
      .getMetadata(address, GUARDIANS_SERVICE_CONSTANTS.metadataKeys.rewardsFrequency)
      .call();

    if (!rewardsFrequency || !rewardsFrequency.length) {
      return GUARDIANS_SERVICE_CONSTANTS.emptyRewardsFrequencyValue;
    }

    return parseInt(rewardsFrequency);
  }

  public async readGuardianId(address: string): Promise<string | null> {
    const guardianId = await this.guardiansRegistrationContract.methods
      .getMetadata(address, GUARDIANS_SERVICE_CONSTANTS.metadataKeys.guardianId)
      .call();

    if (!guardianId || !guardianId.length) {
      return null;
    }

    return guardianId;
  }

  public setGuardianId(guardianId: string): PromiEvent<TransactionReceipt> {
    return this.guardiansRegistrationContract.methods
      .setMetadata(GUARDIANS_SERVICE_CONSTANTS.metadataKeys.guardianId, guardianId)
      .send();
  }

  public async readGuardianDetailsPageUrl(address: string): Promise<string | null> {
    const guardianDetailsPageUrl = await this.guardiansRegistrationContract.methods
        .getMetadata(address, GUARDIANS_SERVICE_CONSTANTS.metadataKeys.guardianDetailsPageUrl)
        .call();

    if (!guardianDetailsPageUrl || !guardianDetailsPageUrl.length) {
      return null;
    }

    return guardianDetailsPageUrl;
  }

  public setGuardianDetailsPageUrl(detailsPageUrl: string): PromiEvent<TransactionReceipt> {
    return this.guardiansRegistrationContract.methods
        .setMetadata(GUARDIANS_SERVICE_CONSTANTS.metadataKeys.guardianDetailsPageUrl, detailsPageUrl)
        .send();
  }

  public setGuardianDistributionFrequency(
    frequencyInSeconds: number
  ): PromiEvent<TransactionReceipt> {
    return this.guardiansRegistrationContract.methods
      .setMetadata(GUARDIANS_SERVICE_CONSTANTS.metadataKeys.rewardsFrequency, frequencyInSeconds.toString())
      .send();
  }

  public registerGuardian(
    guardianRegistrationPayload: TGuardianRegistrationPayload
  ): PromiEvent<TransactionReceipt> {
    const { website, name, orbsAddr, ip } = guardianRegistrationPayload;

    const ipAsHex = ipv4ToHex(ip);

    return this.guardiansRegistrationContract.methods
      .registerGuardian(ipAsHex, orbsAddr, name, website)
      .send();
  }

  public updateGuardianInfo(
    guardianUpdatePayload: TGuardianUpdatePayload
  ): PromiEvent<TransactionReceipt> {
    const { ip, name, orbsAddr, website } = guardianUpdatePayload;
    const ipAsHex = ipv4ToHex(ip);

    return this.guardiansRegistrationContract.methods
      .updateGuardian(ipAsHex, orbsAddr, name, website)
      .send();
  }

  public unregisterGuardian(): PromiEvent<TransactionReceipt> {
    return this.guardiansRegistrationContract.methods
      .unregisterGuardian()
      .send();
  }
}
