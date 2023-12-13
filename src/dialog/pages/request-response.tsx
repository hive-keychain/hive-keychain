import React from 'react';
import ButtonComponent from 'src/common-ui/button/button.component';
import { NewIcons } from 'src/common-ui/icons.enum';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';

type Props = {
  data: ResultMessage;
};

type ResultMessage = {
  msg: { message: string; success: boolean };
};

const RequestResponse = ({ data }: Props) => {
  if (data.msg.success) {
    setTimeout(() => {
      // window.close();
    }, 3000);
  }
  return (
    <div className="response-message-container">
      <div className="message-card">
        <SVGIcon
          icon={
            data.msg.success ? NewIcons.MESSAGE_SUCCESS : NewIcons.MESSAGE_ERROR
          }
        />
        <div className="title">
          {chrome.i18n.getMessage(
            data.msg.success
              ? 'message_container_title_success'
              : 'message_container_title_fail',
          )}
        </div>
        <div className="message">
          {data.msg.message.split(/<br\s?\/?>/g).map((msg, index) => (
            <p key={`p-${index}`} style={{ wordBreak: 'break-word' }}>
              {msg}
            </p>
          ))}
        </div>
        <ButtonComponent
          label="message_container_close_button"
          onClick={close}
        />
      </div>
    </div>

    // <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
    //   <DialogHeader
    //     title={
    //       data.msg.success
    //         ? `${chrome.i18n.getMessage('dialog_header_success')} !`
    //         : `${chrome.i18n.getMessage('dialog_header_error')} !`
    //     }
    //   />
    //   {data.msg.message.split(/<br\s?\/?>/g).map((msg) => (
    //     <div className="caption" style={{ wordBreak: 'break-word' }}>
    //       {msg}
    //     </div>
    //   ))}
    //   <div className="fill-space" />
    //   <ButtonComponent
    //     label={'dialog_ok'}
    //     onClick={() => {
    //       window.close();
    //     }}
    //   />
    // </div>
  );
};

export default RequestResponse;
