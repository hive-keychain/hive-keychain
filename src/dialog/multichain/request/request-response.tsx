import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import { KeychainRequest } from 'hive-keychain-commons';
import React from 'react';
import ButtonComponent from 'src/common-ui/button/button.component';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';

type Props = {
  data: ResultMessage;
};

type ResultMessage = {
  msg: { message: string; success: boolean; data: KeychainRequest };
  command: DialogCommand;
};

const RequestResponse = ({ data }: Props) => {
  if (data.msg.success) {
    setTimeout(() => {
      window.close();
    }, 3000);
  }

  const getErrorMessage = () => {
    switch (data.command) {
      case DialogCommand.ANSWER_EVM_REQUEST: {
        return <>{data.msg.message}</>;
      }
      case DialogCommand.ANSWER_REQUEST: {
        return (
          <>
            {data.msg.message.split(/<br\s?\/?>/g).map((msg, index) => (
              <p key={`p-${index}`} style={{ wordBreak: 'break-word' }}>
                {msg}
              </p>
            ))}
          </>
        );
      }
    }
  };

  return (
    <>
      <div className="response-message-container">
        <div className="message-card">
          <SVGIcon
            icon={
              data.msg.success
                ? SVGIcons.MESSAGE_SUCCESS
                : SVGIcons.MESSAGE_ERROR
            }
          />
          <div className={`title ${data.msg.success ? 'success' : ''}`}>
            {chrome.i18n.getMessage(
              data.msg.success
                ? 'message_container_title_success'
                : 'message_container_title_fail',
            )}
          </div>
          <div className="message">{getErrorMessage()}</div>
        </div>
      </div>
      <ButtonComponent
        additionalClass={data.msg.success ? 'success-button' : ''}
        label="message_container_close_button"
        onClick={close}
      />
    </>
  );
};

export default RequestResponse;
