import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import React, { useEffect, useState } from 'react';
import DialogError from 'src/dialog/pages/error';
import Register from 'src/dialog/pages/register';
import RequestConfirmation from 'src/dialog/pages/request-confirmation';
import RequestResponse from 'src/dialog/pages/request-response';
import Unlock from 'src/dialog/pages/unlock';
import BrowserUtils from 'src/utils/browser.utils';
import './dialog.scss';

const App = () => {
  useEffect(() => {
    chrome.runtime.onMessage.addListener(async function (
      data,
      sender,
      sendResp,
    ) {
      if (data.command === DialogCommand.READY) {
        return BrowserUtils.sendResponse(true, sendResp);
      } else if (Object.values(DialogCommand).includes(data.command)) {
        setData(data);
      }
      chrome.windows.update((await chrome.windows.getCurrent()).id!, {
        focused: true,
      });
    });
  }, []);

  const [data, setData] = useState<any>({});

  const renderDialogContent = () => {
    switch (data.command) {
      case DialogCommand.UNLOCK:
        return <Unlock data={data} />;
      case DialogCommand.WRONG_MK:
        return <Unlock data={data} wrongMk index={Math.random()} />;
      case DialogCommand.SEND_DIALOG_ERROR:
        return <DialogError data={data} />;
      case DialogCommand.REGISTER:
        return <Register data={data} />;
      case DialogCommand.SEND_DIALOG_CONFIRM:
        return <RequestConfirmation data={data} />;
      case DialogCommand.ANSWER_REQUEST:
        return <RequestResponse data={data} />;
      default:
        return null;
    }
  };

  return <div className="dialog">{renderDialogContent()}</div>;
};

export default App;
