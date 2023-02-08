import { ActiveAccount } from 'src/interfaces/active-account.interface';
import { LocalStorageKeyEnum } from 'src/reference-data/local-storage-key.enum';
import FormatUtils from 'src/utils/format.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';

const isEmpty = (activeAccount: ActiveAccount) => {
  return (
    !activeAccount.account || Object.keys(activeAccount.account).length === 0
  );
};
/* istanbul ignore next */
const saveActiveAccountNameInLocalStorage = (activeAccountName: string) => {
  LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.ACTIVE_ACCOUNT_NAME,
    activeAccountName,
  );
};
/* istanbul ignore next */
const getActiveAccountNameFromLocalStorage = async () => {
  const account = await LocalStorageUtils.getValueFromLocalStorage(
    LocalStorageKeyEnum.ACTIVE_ACCOUNT_NAME,
  );
  return account && account.length ? account : undefined;
};

const hasReward = (
  reward_hbd: string,
  reward_hp: string,
  reward_hive: string,
): boolean => {
  return (
    ActiveAccountUtils.getValFromString(reward_hbd) !== 0 ||
    ActiveAccountUtils.getValFromString(reward_hp) !== 0 ||
    ActiveAccountUtils.getValFromString(reward_hive) !== 0
  );
};

const getValFromString = (string: string): number => {
  return parseFloat(string.split(' ')[0]);
};

const getAvailableRewards = (activeAccount: ActiveAccount) => {
  let reward_hbd = activeAccount.account.reward_hbd_balance;
  let reward_vests = activeAccount.account.reward_vesting_balance;
  const reward_hp = FormatUtils.toHP(reward_vests as string) + ' HP';
  let reward_hive = activeAccount.account.reward_hive_balance;
  let rewardText = chrome.i18n.getMessage('popup_account_redeem') + ':<br>';
  if (getValFromString(reward_hp) != 0) rewardText += reward_hp + ' / ';
  if (getValFromString(reward_hbd as string) != 0)
    rewardText += reward_hbd + ' / ';
  if (getValFromString(reward_hive as string) != 0)
    rewardText += reward_hive + ' / ';
  rewardText = rewardText.slice(0, -3);
  return [reward_hbd, reward_hp, reward_hive, rewardText];
};

const ActiveAccountUtils = {
  isEmpty,
  saveActiveAccountNameInLocalStorage,
  getActiveAccountNameFromLocalStorage,
  hasReward,
  getAvailableRewards,
  getValFromString,
};

export default ActiveAccountUtils;
