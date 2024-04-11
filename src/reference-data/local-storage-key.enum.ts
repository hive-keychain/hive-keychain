export enum LocalStorageKeyEnum {
  ACCOUNTS = 'accounts',
  RPC_LIST = 'rpc',
  CURRENT_RPC = 'current_rpc',
  ACTIVE_ACCOUNT_NAME = 'active_account_name',
  FAVORITE_USERS = 'transfer_to',
  KEYCHAINIFY_ENABLED = 'keychainify_enabled',
  CLAIM_REWARDS = 'claimRewards',
  CLAIM_ACCOUNTS = 'claimAccounts',
  CLAIM_SAVINGS = 'claimSavings',
  AUTOLOCK = 'autolock',
  NO_CONFIRM = 'no_confirm',
  WALLET_HISTORY_FILTERS = 'walletHistoryFilters',
  HIDDEN_TOKENS = 'hidden_tokens',
  LOCAL_STORAGE_VERSION = 'LOCAL_STORAGE_VERSION',
  __MK = '__MK',
  __REQUEST_HANDLER = '__REQUEST_HANDLER',
  SWITCH_RPC_AUTO = 'switchRpcAuto',
  HIDE_SUGGESTION_PROXY = 'HIDE_SUGGESTION_PROXY',
  LAST_VERSION_UPDATE = 'LAST_VERSION_UPDATE',
  HIVE_ENGINE_CUSTOM_RPC_LIST = 'HIVE_ENGINE_CUSTOM_RPC_LIST',
  HIVE_ENGINE_CUSTOM_ACCOUNT_HISTORY_API = 'HIVE_ENGINE_CUSTOM_ACCOUNT_HISTORY_API',
  HIVE_ENGINE_ACTIVE_CONFIG = 'HIVE_ENGINE_ACTIVE_CONFIG',
  ANALYTICS_SETTINGS = 'ANALYTICS_SETTINGS',
  GA_CLIENT_ID = 'GA_CLIENT_ID',
  ANALYTICS_FIRST_ACCOUNT_EVENT_SENT = 'ANALYTICS_FIRST_ACCOUNT_EVENT_SENT',
  GOVERNANCE_RENEWAL_IGNORED = 'GOVERNANCE_RENEWAL_IGNORED',
  SURVEY_INFO = 'SURVEY_INFO',
  IS_LEDGER_SUPPORTED = 'IS_LEDGER_SUPPORTED',
  SWAP_LAST_USED_TOKENS = 'SWAP_LAST_USED_TOKENS',
  NO_KEY_CHECK = 'NO_KEY_CHECK',
  WITNESS_LAST_SIGNING_KEY = 'WITNESS_LAST_SIGNING_KEY',
  LAST_PRICE = 'LAST_PRICE',
  MULTISIG_CONFIG = 'MULTISIG_CONFIG',

  PORTFOLIO_FILTER = 'PORTFOLIO_FILTER',

  // Global keys
  ACTIVE_CHAIN = 'ACTIVE_CHAIN',
  ACTIVE_THEME = 'ACTIVE_THEME',

  // To show the right type of account value
  ACCOUNT_VALUE_TYPE = 'ACCOUNT_VALUE_TYPE',

  // To check if some account (regardless of chain) has been setup
  HAS_FINISHED_SIGNUP = 'HAS_FINISHED_SIGNUP',
  EVM_ACCOUNTS = 'EVM_ACCOUNTS',
}
