import React from 'react';
import CheckboxComponent, {
  CheckboxProps,
} from 'src/common-ui/checkbox/checkbox/checkbox.component';

export enum BackgroundType {
  TRANSPARENT = 'transparent',
  FILLED = 'filled',
}

interface CheckboxPanelProps extends CheckboxProps {
  backgroundType?: BackgroundType;
  hint?: string;
  skipHintTranslation?: boolean;
  text?: string;
  skipTextTranslation?: boolean;
  children?: JSX.Element;
}

export const CheckboxPanelComponent = (props: CheckboxPanelProps) => {
  return (
    <div
      className={`checkbox-panel ${
        props.backgroundType ?? BackgroundType.FILLED
      } ${props.hint ? 'has-hint' : ''} ${props.text ? 'has-text' : ''}`}
      onClick={() => props.onChange(!props.checked)}>
      <CheckboxComponent {...props} />
      {props.children && props.children}
      {!props.children && (
        <>
          {props.hint && (
            <div
              className="hint"
              dangerouslySetInnerHTML={{
                __html: props.skipHintTranslation
                  ? props.hint
                  : chrome.i18n.getMessage(props.hint),
              }}></div>
          )}
          {props.text && (
            <div
              className="text"
              dangerouslySetInnerHTML={{
                __html: props.skipTextTranslation
                  ? props.text
                  : chrome.i18n.getMessage(props.text),
              }}></div>
          )}
        </>
      )}
    </div>
  );
};
