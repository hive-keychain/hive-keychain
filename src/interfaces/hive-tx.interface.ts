export interface TransactionResult {
  tx_id: string;
  id: string;
  // status: string;
  // block_num: number;
  confirmed?: boolean;
}

export interface HiveTxBroadcastResult {
  status: string;
  tx_id: string;
}

export interface HiveTxBroadcastSuccessResponse {
  id: number;
  jsonrpc: string;
  result: HiveTxBroadcastResult;
}

export interface HiveTxBroadcastErrorResponse {
  error: object;
}
