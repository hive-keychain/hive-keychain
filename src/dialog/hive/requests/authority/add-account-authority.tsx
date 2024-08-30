import {
  RequestAddAccountAuthority,
  RequestId,
} from '@interfaces/keychain.interface';
import { Rpc } from '@interfaces/rpc.interface';
import React from 'react';
import { Separator } from 'src/common-ui/separator/separator.component';
import RequestItem from 'src/dialog/components/request-item/request-item';
import Operation from 'src/dialog/hive/operation/operation';

type Props = {
  data: RequestAddAccountAuthority & RequestId;
  domain: string;
  tab: number;
  rpc: Rpc;
};

const AddAccountAuthority = (props: Props) => {
  const { data } = props;
  return (
    <Operation
      title={chrome.i18n.getMessage('dialog_title_add_auth')}
      {...props}>
      <RequestItem title="dialog_account" content={`@${data.username}`} />
      <Separator type={'horizontal'} fullSize />
      <RequestItem
        title="dialog_auth_account"
        content={`@${data.authorizedUsername}`}
      />
      <Separator type={'horizontal'} fullSize />
      <RequestItem title="dialog_role" content={data.role} />
      <Separator type={'horizontal'} fullSize />
      <RequestItem title="dialog_weight" content={data.weight + ''} />
    </Operation>
  );
};

export default AddAccountAuthority;
