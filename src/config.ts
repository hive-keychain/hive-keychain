const Config = {
  hiveEngine: {
    MAINNET: 'ssc-mainnet-hive',
  },
  claims: {
    FREQUENCY: +(process.env.DEV_CLAIM_FREQUENCY || 10),
    freeAccount: {
      MIN_RC_PCT: +(process.env.DEV_CLAIM_ACCOUNT_RC_PCT || 85),
      MIN_RC: +(process.env.DEV_CLAIM_ACCOUNT_MIN_RC || 1.2 * 10 * 10 ** 12), // 20% more than 10^13 (current creation cost)
    },
  },
  PROPOSAL: 216,
  MIN_LOADING_TIME: 1000,
  rpc: {
    DEFAULT: { uri: 'https://api.hive.blog', testnet: false },
  },
};

export default Config;
