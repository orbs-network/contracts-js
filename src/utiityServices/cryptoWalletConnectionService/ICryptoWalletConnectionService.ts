export interface ICryptoWalletConnectionService {
  readonly hasEthereumProvider: boolean;
  readonly hasEventsSupport: boolean;
  readonly isMetamaskInstalled: boolean;
  readonly isSemiCompliantEthereumProviderInstalled: boolean;

  // Getters
  readEthereumBalance: (address: string) => Promise<number>;
  didUserApproveDappInThePast: boolean;
  readMainAddress: () => Promise<string>;
  readCurrentBlockNumber: () => Promise<number>;
  getIsMainNetwork: () => Promise<boolean>;

  requestConnectionPermission: () => Promise<boolean>;

  // Event listeners
  onMainAddressChange: (onChange: (mainAddress: string) => void) => () => void;
}
