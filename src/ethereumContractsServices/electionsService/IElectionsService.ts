

export interface IGetSettingsResult {
  minSelfStakePercentMille: string;
  voteUnreadyPercentMilleThreshold: string;
  voteOutPercentMilleThreshold: string;
  0: string;
  1: string;
  2: string;
}

export interface IElectionsService {
  getSettings: () => Promise<IGetSettingsResult>;
}