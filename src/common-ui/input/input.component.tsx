import { Icons } from '@popup/icons.enum';
import React, { useEffect, useState } from 'react';
import Icon, { IconType } from 'src/common-ui/icon/icon.component';
import { InputType } from './input-type.enum';
import './input.component.scss';

export interface AutoCompleteValue {
  value: string;
  subLabel?: string;
}

interface InputProps {
  onChange: (value: any) => void;
  value: any;
  logo?: Icons | string;
  label?: string;
  placeholder: string;
  type: InputType;
  step?: number;
  min?: number;
  max?: number;
  skipLabelTranslation?: boolean;
  skipPlaceholderTranslation?: boolean;
  hint?: string;
  skipHintTranslation?: boolean;
  autocompleteValues?: AutoCompleteValue[];
  required?: boolean;
  hasError?: boolean;
  ariaLabel?: string;
  disabled?: boolean;
  onEnterPress?(): any;
  onSetToMaxClicked?(): any;
}

const InputComponent = (props: InputProps) => {
  const [filteredValues, setFilteredValues] = useState<AutoCompleteValue[]>(
    props.autocompleteValues ? props.autocompleteValues : [],
  );

  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordDisplay, setPasswordDisplayed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [hoveredAutocompleteValue, setHoveredAutocompleteValue] = useState<
    number | null
  >(null);

  useEffect(() => {
    setMounted(true);
    return function cleanup() {
      setMounted(false);
    };
  });

  useEffect(() => {
    if (props.autocompleteValues) {
      setFilteredValues(
        props.autocompleteValues.filter(
          (val) =>
            val.value?.toLowerCase().includes(props.value) ||
            val.subLabel?.toLowerCase().includes(props.value),
        ),
      );
    }
  }, [props.value, props.autocompleteValues]);

  const handleOnBlur = () => {
    if (mounted) {
      setTimeout(() => setIsFocused(false), 200);
    }
  };
  const handleOnFocus = () => {
    setIsFocused(true);
  };

  const handleKeyPressed = (key: string) => {
    switch (key) {
      case 'Enter': {
        if (props.onEnterPress) props.onEnterPress();
        break;
      }
      case 'ArrowDown': {
        if (filteredValues.length > 0) {
          let index = hoveredAutocompleteValue;
          if (index === null) {
            index = 0;
          } else {
            if (index < filteredValues.length - 1) {
              index++;
            } else {
              index = 0;
            }
          }
          setHoveredAutocompleteValue(index);
          document
            .getElementById(`filtered-value-${index}`)
            ?.scrollIntoView({ behavior: 'auto' });
        }
        break;
      }
      case 'ArrowUp': {
        if (filteredValues.length > 0) {
          let index = hoveredAutocompleteValue;
          if (!index) {
            index = filteredValues.length - 1;
          } else {
            if (index > 0) {
              index--;
            }
          }
          setHoveredAutocompleteValue(index);
          document
            .getElementById(`filtered-value-${index}`)
            ?.scrollIntoView({ behavior: 'smooth' });
        }
        break;
      }
    }
  };

  const removeHoverAutocomplete = () => {
    setHoveredAutocompleteValue(null);
  };

  const hoverAutocompleteValue = (index: number) => {
    setHoveredAutocompleteValue(index);
  };

  return (
    <div className="custom-input">
      {props.label && (
        <div className="label">
          {props.skipLabelTranslation
            ? props.label
            : chrome.i18n.getMessage(props.label)}{' '}
          {props.required ? '*' : ''}
        </div>
      )}
      <div
        className={`input-container ${props.logo ? '' : 'no-logo'} ${
          props.type === InputType.PASSWORD ? 'password-type' : ''
        } ${isFocused ? 'focused' : ''} `}>
        <input
          aria-label={props.ariaLabel}
          className={`${props.hasError ? 'has-error' : ''} ${
            props.onSetToMaxClicked ? 'has-max-button' : ''
          }`}
          type={
            props.type === InputType.PASSWORD && isPasswordDisplay
              ? InputType.TEXT
              : props.type
          }
          placeholder={`${
            props.skipPlaceholderTranslation
              ? props.placeholder
              : chrome.i18n.getMessage(props.placeholder)
          } ${props.required ? '*' : ''}`}
          value={props.value}
          step={props.step}
          min={props.min}
          max={props.max}
          onChange={(e) => props.onChange(e.target.value)}
          onKeyDown={(e) => handleKeyPressed(e.key)}
          onFocus={() => handleOnFocus()}
          onBlur={() => handleOnBlur()}
        />
        {props.type === InputType.PASSWORD && !isPasswordDisplay && (
          <Icon
            onClick={() => setPasswordDisplayed(true)}
            name={Icons.VISIBLE}
            type={IconType.OUTLINED}
            additionalClassName="input-img display-password"></Icon>
        )}
        {props.type === InputType.PASSWORD && isPasswordDisplay && (
          <Icon
            onClick={() => setPasswordDisplayed(false)}
            name={Icons.HIDDEN}
            type={IconType.OUTLINED}
            additionalClassName="input-img display-password"></Icon>
        )}
        {props.type !== InputType.PASSWORD &&
          !props.onSetToMaxClicked &&
          props.value &&
          props.value.length > 0 && (
            <Icon
              ariaLabel="input-clear"
              onClick={() => props.onChange('')}
              name={Icons.CLEAR}
              type={IconType.OUTLINED}
              additionalClassName="input-img erase"></Icon>
          )}
        {isFocused && filteredValues && filteredValues.length > 0 && (
          <div
            className="autocomplete-panel"
            onMouseLeave={() => removeHoverAutocomplete()}>
            {filteredValues.map((val, index) => (
              <div
                id={`filtered-value-${index}`}
                key={index}
                className={`value ${
                  index === hoveredAutocompleteValue ? 'hovered' : ''
                }`}
                onClick={() => props.onChange(val.value)}
                onMouseEnter={() => hoverAutocompleteValue(index)}>
                {val.value} {val.subLabel ? `(${val.subLabel})` : ''}
              </div>
            ))}
          </div>
        )}
        {props.hint && (
          <div className="hint">
            {props.skipHintTranslation
              ? props.hint
              : chrome.i18n.getMessage(props.hint)}
          </div>
        )}
        {props.logo && (
          <Icon
            name={props.logo}
            type={IconType.OUTLINED}
            additionalClassName="input-img"></Icon>
        )}
        {props.onSetToMaxClicked && (
          <span
            aria-label="set-to-max-button"
            className="set-to-max-button"
            onClick={props.onSetToMaxClicked}>
            {chrome.i18n.getMessage('popup_html_send_max')}
          </span>
        )}
      </div>
    </div>
  );
};

export default InputComponent;
