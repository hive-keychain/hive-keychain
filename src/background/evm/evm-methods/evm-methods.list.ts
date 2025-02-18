import { EvmRequestPermission } from '@background/evm/evm-methods/evm-permission.list';

export enum EvmRequestMethod {
  CALL = 'eth_call',
  COINBASE = 'eth_coinbase',
  ESTIMATE_GAS_FEE = 'eth_estimateGas',
  FEE_HISTORY = 'eth_feeHistory',
  GAS_PRICE = 'eth_gasPrice',
  GET_ACCOUNTS = 'eth_accounts',
  GET_BALANCE = 'eth_getBalance',
  GET_BLOCK_NUMBER = 'eth_blockNumber',
  GET_BLOCK_BY_HASH = 'eth_getBlockByHash',
  GET_BLOCK_BY_NUMBER = 'eth_getBlockByNumber',
  GET_CHAIN = 'eth_chainId',
  GET_CODE = 'eth_getCode',
  GET_ENCRYPTION_KEY = 'eth_getEncryptionPublicKey',
  GET_HASH_RATE = 'eth_hashrate',
  GET_MINING = 'eth_mining',
  GET_NETWORK = 'net_version',
  GET_TRANSACTION_BY_HASH = 'eth_getTransactionByHash',
  GET_TRANSACTION_BY_HASH_AND_INDEX = 'eth_getTransactionByBlockHashAndIndex',
  GET_TRANSACTION_BY_BLOCK_NUMBER_AND_INDEX = 'eth_getTransactionByBlockNumberAndIndex',
  GET_TRANSACTION_COUNT = 'eth_getTransactionCount',
  GET_TRANSACTION_COUNT_BY_HASH = 'eth_getBlockTransactionCountByHash',
  GET_TRANSACTION_COUNT_BY_NUMBER = 'eth_getBlockTransactionCountByNumber',
  GET_TRANSACTION_COUNT_FOR_ADDRESS = 'eth_getTransactionCount',
  GET_TRANSACTION_RECEIPT = 'eth_getTransactionReceipt',
  GET_UNCLE_BY_BLOCK_HASH_AND_INDEX = 'eth_getUncleByBlockHashAndIndex',
  GET_UNCLE_BY_BLOCK_NUMBER_AND_INDEX = 'eth_getUncleByBlockNumberAndIndex',
  GET_UNCLE_COUNT_BY_HASH = 'eth_getUncleCountByBlockHash',
  GET_UNCLE_COUNT_BY_BLOCK_NUMBER = 'eth_getUncleCountByBlockNumber',

  CREATE_ACCESS_LIST = 'eth_createAccessList',

  GET_WORK = 'eth_getWork',
  GET_PROOF = 'eth_getProof',
  GET_STORAGE_AT = 'eth_getStorageAt',
  GET_PROTOCOL_VERSION = 'eth_protocolVersion',
  SUBMIT_HASHRATE = 'eth_submitHashrate',
  SUBMIT_WORK = 'eth_submitWork',

  GET_FILTER_CHANGES = 'eth_getFilterChanges',
  GET_FILTER_LOGS = 'eth_getFilterLogs',
  NEW_BLOCK_FILTER = 'eth_newBlockFilter',
  NEW_FILTER = 'eth_newFilter',
  UNINSTALL_FILTER = 'eth_uninstallFilter',
  NEW_PENDING_TRANSACTION_FILTER = 'eth_newPendingTransactionFilter',
  SUBSCRIBE = 'eth_subscribe',
  UNSUBSCRIBE = 'eth_unsubscribe',
  SYNCING = 'eth_syncing',
  GET_LOGS = 'eth_getLogs',

  MM_GET_PROVIDER_STATE = 'metamask_getProviderState',
  MM_LOG_WEB3_SHIM_USAGE = 'metamask_logWeb3ShimUsage',
  MM_SEND_DOMAIN_METADATA = 'metamask_sendDomainMetadata',
  MM_WATCH_ASSET = 'metamask_watchAsset',

  NET_LISTENING = 'net_listening',
  NET_PEER_COUNT = 'net_peerCount',

  PERSONAL_RECOVER = 'personal_ecRecover',

  REQUEST_ACCOUNTS = 'eth_requestAccounts',
  SEND_RAW_TRANSACTION = 'eth_sendRawTransaction',
  SEND_TRANSACTION = 'eth_sendTransaction',

  WALLET_REVOKE_PERMISSION = 'wallet_revokePermissions',
  WALLET_ADD_ETH_CHAIN = 'wallet_addEthereumChain',
  WALLET_GET_PERMISSIONS = 'wallet_getPermissions',
  WALLET_REQUEST_PERMISSIONS = 'wallet_requestPermissions',
  WALLET_REGISTER_ON_BOARDING = 'wallet_registerOnboarding',
  WALLET_SWITCH_ETHEREUM_CHAIN = 'wallet_switchEthereumChain',
  WALLET_WATCH_ASSETS = 'wallet_watchAsset',
  WALLET_INVOKE_KEYRING = 'wallet_invokeKeyring',
  WEB3_CLIENT_VERSION = 'web3_clientVersion',
  WEB3_SHA3 = 'web3_sha3',

  ETH_SIGN_DATA = 'eth_signTypedData',
  ETH_SIGN_DATA_1 = 'eth_signTypedData_v1',
  ETH_SIGN_DATA_3 = 'eth_signTypedData_v3',
  ETH_SIGN_DATA_4 = 'eth_signTypedData_v4',
  PERSONAL_SIGN = 'personal_sign',
  ETH_SIGN = 'eth_sign',
  ETH_DECRYPT = 'eth_decrypt',
}

export const doesMethodExist = (method: string) => {
  return (Object.values(EvmRequestMethod) as string[]).includes(method);
};

export const EvmRestrictedMethods = [
  EvmRequestMethod.WALLET_ADD_ETH_CHAIN,
  EvmRequestMethod.WALLET_REQUEST_PERMISSIONS,
  EvmRequestMethod.WALLET_REGISTER_ON_BOARDING,
  EvmRequestMethod.WALLET_SWITCH_ETHEREUM_CHAIN,
  EvmRequestMethod.WALLET_WATCH_ASSETS,
  EvmRequestMethod.WALLET_INVOKE_KEYRING,
  EvmRequestMethod.REQUEST_ACCOUNTS,
  EvmRequestMethod.GET_ENCRYPTION_KEY,
  EvmRequestMethod.SEND_TRANSACTION,
];

export const EvmNeedPermissionMethods = [
  EvmRequestMethod.ETH_SIGN_DATA_4,
  EvmRequestMethod.PERSONAL_SIGN,
  EvmRequestMethod.ETH_SIGN,
  EvmRequestMethod.ETH_DECRYPT,
  EvmRequestMethod.PERSONAL_RECOVER,
];

export const EvmMethodPermissionMap: {
  [key in EvmRequestMethod]?: EvmRequestPermission;
} = {
  [EvmRequestMethod.GET_ACCOUNTS]: EvmRequestPermission.ETH_ACCOUNTS,
  [EvmRequestMethod.REQUEST_ACCOUNTS]: EvmRequestPermission.ETH_ACCOUNTS,
  [EvmRequestMethod.ETH_SIGN_DATA_4]: EvmRequestPermission.ETH_ACCOUNTS,
  [EvmRequestMethod.PERSONAL_SIGN]: EvmRequestPermission.ETH_ACCOUNTS,
  [EvmRequestMethod.ETH_SIGN]: EvmRequestPermission.ETH_ACCOUNTS,
  [EvmRequestMethod.ETH_DECRYPT]: EvmRequestPermission.ETH_ACCOUNTS,
  [EvmRequestMethod.PERSONAL_RECOVER]: EvmRequestPermission.ETH_ACCOUNTS,
};

export const EvmUnrestrictedMethods = [
  EvmRequestMethod.WALLET_REVOKE_PERMISSION,
  EvmRequestMethod.GET_ACCOUNTS,
  EvmRequestMethod.GET_BLOCK_NUMBER,
  EvmRequestMethod.CALL,
  EvmRequestMethod.GET_CHAIN,
  EvmRequestMethod.COINBASE,
  EvmRequestMethod.ESTIMATE_GAS_FEE,
  EvmRequestMethod.FEE_HISTORY,
  EvmRequestMethod.GAS_PRICE,
  EvmRequestMethod.GET_BLOCK_BY_HASH,
  EvmRequestMethod.GET_BLOCK_BY_NUMBER,
  EvmRequestMethod.GET_TRANSACTION_BY_BLOCK_NUMBER_AND_INDEX,
  EvmRequestMethod.GET_TRANSACTION_BY_HASH,
  EvmRequestMethod.GET_TRANSACTION_COUNT_BY_HASH,
  EvmRequestMethod.GET_TRANSACTION_COUNT_BY_NUMBER,
  EvmRequestMethod.GET_CODE,
  EvmRequestMethod.GET_BALANCE,
  EvmRequestMethod.GET_FILTER_CHANGES,
  EvmRequestMethod.GET_FILTER_LOGS,
  EvmRequestMethod.GET_LOGS,
  EvmRequestMethod.GET_PROOF,
  EvmRequestMethod.GET_STORAGE_AT,
  EvmRequestMethod.GET_TRANSACTION_COUNT,
  EvmRequestMethod.GET_TRANSACTION_RECEIPT,
  EvmRequestMethod.GET_UNCLE_BY_BLOCK_HASH_AND_INDEX,
  EvmRequestMethod.GET_UNCLE_BY_BLOCK_NUMBER_AND_INDEX,
  EvmRequestMethod.GET_UNCLE_COUNT_BY_HASH,
  EvmRequestMethod.GET_UNCLE_COUNT_BY_BLOCK_NUMBER,
  EvmRequestMethod.GET_WORK,
  EvmRequestMethod.GET_HASH_RATE,
  EvmRequestMethod.GET_MINING,
  EvmRequestMethod.NEW_BLOCK_FILTER,
  EvmRequestMethod.NEW_FILTER,
  EvmRequestMethod.NEW_PENDING_TRANSACTION_FILTER,
  EvmRequestMethod.GET_PROTOCOL_VERSION,
  EvmRequestMethod.SUBMIT_HASHRATE,
  EvmRequestMethod.SUBMIT_WORK,
  EvmRequestMethod.SUBSCRIBE,
  EvmRequestMethod.SYNCING,
  EvmRequestMethod.UNINSTALL_FILTER,
  EvmRequestMethod.UNSUBSCRIBE,
  EvmRequestMethod.NET_LISTENING,
  EvmRequestMethod.NET_PEER_COUNT,
  EvmRequestMethod.GET_NETWORK,
  EvmRequestMethod.PERSONAL_RECOVER,
  EvmRequestMethod.WALLET_GET_PERMISSIONS,
  EvmRequestMethod.WEB3_CLIENT_VERSION,
  EvmRequestMethod.WEB3_SHA3,
  EvmRequestMethod.CREATE_ACCESS_LIST,
];
