import { RequestAddAccount, RequestId } from '@interfaces/keychain.interface';
import { Rpc } from '@interfaces/rpc.interface';
import React from 'react';
import { Separator } from 'src/common-ui/separator/separator.component';
import CollaspsibleItem from 'src/dialog/components/collapsible-item/collapsible-item';
import RequestItem from 'src/dialog/components/request-item/request-item';
import Operation from 'src/dialog/hive/operation/operation';

type Props = {
  data: RequestAddAccount & RequestId;
  domain: string;
  tab: number;
  rpc: Rpc;
};

const AddAccount = (props: Props) => {
  const { data } = props;
  return (
    <Operation
      title={chrome.i18n.getMessage('popup_html_add_account')}
      {...props}
      canWhitelist>
      <RequestItem title="dialog_account" content={`@${data.username}`} />
      <Separator type={'horizontal'} fullSize />
      <CollaspsibleItem
        title="dialog_keys"
        content={JSON.stringify(data.keys, undefined, 2)}
        pre
      />
    </Operation>
  );
};

export default AddAccount;
