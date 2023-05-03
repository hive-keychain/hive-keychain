import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import React, { useEffect, useState } from 'react';
import DialogError from 'src/dialog/pages/error';
import Register from 'src/dialog/pages/register';
import RequestConfirmation from 'src/dialog/pages/request-confirmation';
import RequestResponse from 'src/dialog/pages/request-response';
import SignTransaction from 'src/dialog/pages/sign-transaction';
import Unlock from 'src/dialog/pages/unlock';
import BrowserUtils from 'src/utils/browser.utils';
import './../analytics/analytics/gtag';
import './dialog.scss';

const App = () => {
  const [data, setData] = useState<any>({});
  const initGoogleAnalytics = () => {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
      window.dataLayer.push(arguments); // eslint-disable-line
    };
    window.gtag('js', new Date());
    window.gtag(
      'config',
      process.env.GOOGLE_ANALYTICS_TAG_ID || 'G-1LRCTFLVBH',
      {
        page_path: '/popup',
      },
    );
    window.gtag('set', 'checkProtocolTask', () => {}); // Disables file protocol checking.

    window.gtag('event', 'navigation', {
      page: 'dialog',
    });
  };

  useEffect(() => {
    initGoogleAnalytics();
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

  const renderDialogContent = (data: any) => {
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
      case DialogCommand.SIGN_WITH_LEDGER:
        return <SignTransaction data={data} />;
      default:
        return null;
    }
  };

  return <div className="dialog">{renderDialogContent(data)}</div>;
};

export default App;
