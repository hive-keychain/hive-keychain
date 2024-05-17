import { EVMToken } from '@popup/evm/interfaces/active-account.interface';
import { Erc20Abi } from '@popup/evm/reference-data/abi.data';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import Decimal from 'decimal.js';
import { HDNodeWallet, InfuraProvider, Wallet, ethers } from 'ethers';

const getProvider = (network?: string) => {
  return new InfuraProvider(
    network,
    process.env.INFURA_PROJECT_ID,
    process.env.INFURA_SECRET,
  );
};

const getGasLimit = async (
  chain: EvmChain,
  token: EVMToken,
  receiverAddress: string,
  amount: number,
  wallet: HDNodeWallet,
) => {
  const provider = getProvider(chain.network);
  const connectedWallet = new Wallet(wallet.signingKey, provider);
  const erc20 = new ethers.Contract(
    token.tokenInfo.address!,
    Erc20Abi,
    connectedWallet,
  );

  const estimation = await erc20.transfer.estimateGas(
    receiverAddress,
    amount * 1000000,
  );

  let multiplier = chain.isEth ? 1.5 : 1;

  return Decimal.mul(Number(estimation), multiplier);
};

export const EthersUtils = { getProvider, getGasLimit };
