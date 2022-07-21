import '@testing-library/jest-dom';
import { screen, waitFor } from '@testing-library/react';
import { QueryDOM } from 'src/__tests__/utils-for-testing/enums/enums';
import { ElementQuery } from 'src/__tests__/utils-for-testing/interfaces/elements';
/**
 * Await for assertion, until loads username's on screen.
 * using findBytext.
 */
const awaitMk = async (mk: string) => {
  expect(await screen.findByText(mk)).toBeInTheDocument();
};
/**
 * Await for assertion. findByLabelText
 */
const awaitFind = async (arialabel: string) => {
  expect(await screen.findByLabelText(arialabel)).toBeInTheDocument();
};
/**
 * Await for assertion. findByText
 */
const awaitFindText = async (arialabel: string) => {
  expect(await screen.findByText(arialabel)).toBeInTheDocument();
};
/**
 * getByLabelText
 */
const getByLabelText = (ariaLabel: string) => {
  expect(screen.getByLabelText(ariaLabel)).toBeInTheDocument();
};
/**
 * Using getByDisplayValue, to try to find a value as shown on screen
 */
const getByDisplay = (value: string) => {
  expect(screen.getByDisplayValue(value)).toBeInTheDocument();
};
/**
 * queryByLabelText. More flexible to test appearance/dissapearance of DOM elements.
 * @param {boolean} tobeInDoc Default as true.
 */
const queryByLabel = (ariaLabel: string, tobeInDoc: boolean = true) => {
  tobeInDoc === true
    ? expect(screen.queryByLabelText(ariaLabel)).toBeInTheDocument()
    : expect(screen.queryByLabelText(ariaLabel)).not.toBeInTheDocument();
};
/**
 * Await for assertion. using waitFor under the hood.
 * Can select bewteen getByLabelText or getByText
 */
const awaitFor = async (ariaLabelOrText: string, query: QueryDOM) => {
  await waitFor(() => {
    switch (query) {
      case QueryDOM.BYLABEL:
        expect(screen.getByLabelText(ariaLabelOrText)).toBeInTheDocument();
        break;
      case QueryDOM.BYTEXT:
        expect(screen.getByText(ariaLabelOrText)).toBeInTheDocument();
    }
  });
};
const getOneByText = (text: string) => {
  expect(screen.getByText(text)).toBeInTheDocument();
};
const awaitOneByLabel = async (ariaLabel: string) => {
  expect(await screen.findByLabelText(ariaLabel)).toBeInTheDocument();
};
/**
 * Can select bewteen getByLabelText or getByText
 */
const getByText = (domEl: ElementQuery[]) => {
  for (let index in domEl) {
    switch (domEl[index].query) {
      case QueryDOM.BYLABEL:
        expect(
          screen.getByLabelText(domEl[index].arialabelOrText),
        ).toBeInTheDocument();
        break;
      case QueryDOM.BYTEXT:
        expect(
          screen.getByText(domEl[index].arialabelOrText),
        ).toBeInTheDocument();
        break;
    }
  }
};
/**
 * Await using findByLabelText, check for class on found element.
 */
const toHaveClass = async (ariaLabel: string, _class: string) => {
  expect(await screen.findByLabelText(ariaLabel)).toHaveClass(_class);
};
/**
 * getByLabelText to toHaveValue
 */
const toHaveValue = (arialabel: string, value: string) => {
  expect(screen.getByLabelText(arialabel)).toHaveValue(value);
};

export default {
  awaitMk,
  awaitFor,
  awaitFind,
  getByText,
  awaitFindText,
  getByLabelText,
  queryByLabel,
  getByDisplay,
  getOneByText,
  awaitOneByLabel,
  toHaveClass,
  toHaveValue,
};
