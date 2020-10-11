export const GUARDIANS_SERVICE_CONSTANTS = {
    metadataKeys: {
        rewardsFrequency: 'REWARDS_FREQUENCY_SEC',
        guardianId: 'GUARDIAN_ID',
    },
    /**
     * The value that will return for a guardian that did not change its distribution frequency.
     */
    emptyRewardsFrequencyValue: 14 * 24 * 60 * 60, // 14 days
    rewardsFrequencyMinimumValueInHours: 12,
}
