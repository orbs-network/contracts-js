import Web3 from "web3";
import {AbiItem, sha3Raw} from "web3-utils";
import GuardiansRegistrationContractJson from "@orbs-network/orbs-ethereum-contracts-v2/build/contracts/GuardiansRegistration.json";
import {
  IGuardiansService,
  TGuardianInfoResponse,
  TGuardianRegistrationPayload, TGuardiansRegistrationContractMetadataKeys,
  TGuardianUpdatePayload,
} from "./IGuardiansService";
import { GuardiansRegistration } from "../../contracts/GuardiansRegistration";
import { PromiEvent, TransactionReceipt } from "web3-core";
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

  public async readMetaDataKeys() : Promise<TGuardiansRegistrationContractMetadataKeys> {
    const detailsPageUrlMetaDataKey =  await this.guardiansRegistrationContract.methods.ID_FORM_URL_METADATA_KEY().call();

    const guardiansRegistrationContractMetadataKeys : TGuardiansRegistrationContractMetadataKeys = {
      detailsPageUrl: detailsPageUrlMetaDataKey,
    };

    return guardiansRegistrationContractMetadataKeys;
  }

  public async readGuardianDetailsPageUrl(address: string): Promise<string | null> {
    const metadataKeys = await this.readMetaDataKeys();

    const guardianDetailsPageUrl = await this.guardiansRegistrationContract.methods
        .getMetadata(address, metadataKeys.detailsPageUrl)
        .call();

    if (!guardianDetailsPageUrl || !guardianDetailsPageUrl.length) {
      return null;
    }

    return guardianDetailsPageUrl;
  }

  public async setGuardianDetailsPageUrl(detailsPageUrl: string): Promise<PromiEvent<TransactionReceipt>> {
    const metadataKeys = await this.readMetaDataKeys();

    return this.guardiansRegistrationContract.methods
        .setMetadata(metadataKeys.detailsPageUrl, detailsPageUrl)
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
