import { TransactionConfirmationField } from '@popup/evm/interfaces/evm-transactions.interface';
import React from 'react';
import { useFieldTitle } from 'src/dialog/evm/components/use-field-title.hook';
import FormatUtils from 'src/utils/format.utils';

export const EvmRequestItemNumber = ({
  name,
  value,
  type,
}: TransactionConfirmationField) => {
  const fieldTitle = useFieldTitle(name);

  return (
    <div className="field">
      <div className="label">{fieldTitle}</div>
      <div className="value">{FormatUtils.withCommas(value)}</div>
    </div>
  );
};
