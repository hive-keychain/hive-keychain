import { RequestsHandler } from '@background/requests';
import { createPopup } from '@background/requests/dialog-lifecycle';
import { KeychainRequest } from '@interfaces/keychain.interface';
import { Rpc } from '@interfaces/rpc.interface';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';

export const requestWithConfirmation = (
  requestHandler: RequestsHandler,
  tab: number,
  request: KeychainRequest,
  domain: string,
  current_rpc: Rpc,
) => {
  const callback = () => {
    chrome.runtime.sendMessage({
      command: DialogCommand.SEND_DIALOG_CONFIRM,
      data: request,
      domain,
      tab,
      rpc: current_rpc,
      hiveEngineConfig: requestHandler.hiveEngineConfig,
    });
  };
  createPopup(callback, requestHandler);
};
