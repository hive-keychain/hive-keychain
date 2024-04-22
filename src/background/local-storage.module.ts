import BgdAccountsUtils from '@background/utils/accounts.utils';
import { AutoCompleteValue } from '@interfaces/autocomplete.interface';
import { FavoriteUserItems } from '@interfaces/favorite-user.interface';
import { Rpc } from '@interfaces/rpc.interface';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import RpcUtils from 'src/popup/hive/utils/rpc.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';

const CURRENT_LOCAL_STORAGE_VERSION = 5;
const checkAndUpdateLocalStorage = async () => {
  const localStorageVersion = await LocalStorageUtils.getValueFromLocalStorage(
    LocalStorageKeyEnum.LOCAL_STORAGE_VERSION,
  );

  if (!localStorageVersion) {
    try {
      const autolock = await LocalStorageUtils.getValueFromLocalStorage(
        LocalStorageKeyEnum.AUTOLOCK,
      );
      if (autolock) {
        LocalStorageUtils.saveValueInLocalStorage(
          LocalStorageKeyEnum.AUTOLOCK,
          JSON.parse(autolock),
        );
      }
      const rpcList = await LocalStorageUtils.getValueFromLocalStorage(
        LocalStorageKeyEnum.RPC_LIST,
      );
      if (rpcList) {
        LocalStorageUtils.saveValueInLocalStorage(
          LocalStorageKeyEnum.RPC_LIST,
          JSON.parse(rpcList),
        );
      }

      let activeRpc = await LocalStorageUtils.getValueFromLocalStorage(
        LocalStorageKeyEnum.CURRENT_RPC,
      );
      if (typeof activeRpc === 'string' && activeRpc !== 'DEFAULT') {
        activeRpc =
          RpcUtils.getFullList().find((rpc) => rpc.uri === activeRpc) ||
          RpcUtils.getFullList()[0];
      }

      if (
        !activeRpc ||
        activeRpc.uri === 'DEFAULT' ||
        activeRpc === 'DEFAULT'
      ) {
        LocalStorageUtils.saveValueInLocalStorage(
          LocalStorageKeyEnum.SWITCH_RPC_AUTO,
          true,
        );
        LocalStorageUtils.saveValueInLocalStorage(
          LocalStorageKeyEnum.CURRENT_RPC,
          RpcUtils.getFullList()[0],
        );
      } else {
        LocalStorageUtils.saveValueInLocalStorage(
          LocalStorageKeyEnum.CURRENT_RPC,
          activeRpc,
        );
        LocalStorageUtils.saveValueInLocalStorage(
          LocalStorageKeyEnum.SWITCH_RPC_AUTO,
          false,
        );
      }

      const noConfirm = await LocalStorageUtils.getValueFromLocalStorage(
        LocalStorageKeyEnum.NO_CONFIRM,
      );
      if (noConfirm) {
        LocalStorageUtils.saveValueInLocalStorage(
          LocalStorageKeyEnum.NO_CONFIRM,
          JSON.parse(noConfirm),
        );
      }
    } finally {
      await saveNewLocalStorageVersion(2);
      checkAndUpdateLocalStorage();
    }
  } else {
    switch (localStorageVersion) {
      case 2: {
        let activeRpc: Rpc = await LocalStorageUtils.getValueFromLocalStorage(
          LocalStorageKeyEnum.CURRENT_RPC,
        );
        if (
          [
            'https://anyx.io',
            'https://api.pharesim.me/',
            'https://rpc.ausbit.dev',
            'https://hived.privex.io/',
          ].includes(activeRpc.uri)
        ) {
          LocalStorageUtils.saveValueInLocalStorage(
            LocalStorageKeyEnum.CURRENT_RPC,
            { uri: 'https://api.hive.blog', testnet: false } as Rpc,
          );
        }
        saveNewLocalStorageVersion(3);
      }
      case 3: {
        const actualFavoriteUsers: any =
          await LocalStorageUtils.getValueFromLocalStorage(
            LocalStorageKeyEnum.FAVORITE_USERS,
          );
        //check on format
        let oldFormat = true;
        //validation
        if (actualFavoriteUsers) {
          for (const [key, value] of Object.entries(actualFavoriteUsers)) {
            if (Array.isArray(value)) {
              value.map((favoriteObject) => {
                if (typeof favoriteObject === 'object') {
                  oldFormat = false;
                }
              });
            }
          }
        }
        if (oldFormat) {
          const favoriteUserData: any = {};
          const mk = await LocalStorageUtils.getValueFromSessionStorage(
            LocalStorageKeyEnum.__MK,
          );
          const localAccounts =
            await BgdAccountsUtils.getAccountsFromLocalStorage(mk);
          if (localAccounts) {
            //initialize object.
            for (const localAccount of localAccounts) {
              favoriteUserData[localAccount.name] = [];
            }
            //fill the object initialized
            if (actualFavoriteUsers) {
              for (const [key, value] of Object.entries(
                actualFavoriteUsers as FavoriteUserItems,
              )) {
                favoriteUserData[key] = value.map((account) => {
                  return {
                    value: account,
                    subLabel: '',
                  } as AutoCompleteValue;
                });
              }
            }
            //save in local storage
            LocalStorageUtils.saveValueInLocalStorage(
              LocalStorageKeyEnum.FAVORITE_USERS,
              favoriteUserData,
            );
          }
          saveNewLocalStorageVersion(4);
        }
      }
      case 4: {
        const accounts = await LocalStorageUtils.getValueFromLocalStorage(
          LocalStorageKeyEnum.ACCOUNTS,
        );

        if (accounts && accounts.length)
          await LocalStorageUtils.saveValueInLocalStorage(
            LocalStorageKeyEnum.HAS_FINISHED_SIGNUP,
            true,
          );
        saveNewLocalStorageVersion(5);
      }
    }
  }
};

const saveNewLocalStorageVersion = (version: number) => {
  LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.LOCAL_STORAGE_VERSION,
    version,
  );
};

const LocalStorageModule = { checkAndUpdateLocalStorage };

export default LocalStorageModule;
