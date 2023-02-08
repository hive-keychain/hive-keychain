import { TokenDelegation } from '@interfaces/token-delegation.interface';
import { TokenBalance } from '@interfaces/tokens.interface';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import userData from 'src/__tests__/utils-for-testing/data/user-data';

const balances = [
  {
    _id: 13429,
    account: userData.one.username,
    symbol: 'LEO',
    balance: '38.861',
    stake: '1.060',
    pendingUnstake: '0',
    delegationsIn: '1',
    delegationsOut: '1',
    pendingUndelegations: '0',
  },
  {
    _id: 115171,
    account: userData.one.username,
    symbol: 'BUILDTEAM',
    balance: '100',
    stake: '38.87982783',
    pendingUnstake: '0',
    delegationsIn: '0',
    delegationsOut: '0',
    pendingUndelegations: '0',
  },
  {
    _id: 71441,
    account: userData.one.username,
    symbol: 'PAL',
    balance: '1189.573',
    stake: '702.466',
    pendingUnstake: '0',
    delegationsIn: '0',
    delegationsOut: '0',
    pendingUndelegations: '0',
  },
] as TokenBalance[];

const incomingDelegations = [
  {
    from: 'theghost1980',
    quantity: '100',
    symbol: 'LEO',
    to: mk.user.one,
    created: 1657742138,
    updated: 1657742138,
  },
] as TokenDelegation[];

const outcomingDelegations = [
  {
    from: mk.user.one,
    quantity: '200',
    symbol: 'LEO',
    to: 'cedricguillas',
    created: 1657742138,
    updated: 1657742138,
  },
] as TokenDelegation[];

export default { balances, incomingDelegations, outcomingDelegations };
