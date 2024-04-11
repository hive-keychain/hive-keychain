import { HDNodeWallet } from 'ethers';

export type WalletWithBalance = {
  wallet: HDNodeWallet;
  balance: number;
  selected: boolean;
};
export type StoredEvmAccounts = {
  seed: string;
  accounts: StoredEvmAccount[];
};
export type StoredEvmAccount = {
  id: number;
  path: string;
  hide?: boolean;
};

export type EvmAccount = StoredEvmAccount & {
  wallet: HDNodeWallet;
};
