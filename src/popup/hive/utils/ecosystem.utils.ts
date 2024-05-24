import { KeychainApi } from 'src/api/keychain';

const getDappList = async (chain: string) => {
  return KeychainApi.get(`${chain.toLowerCase()}/ecosystem/dapps`);
};

export const EcosystemUtils = { getDappList };
