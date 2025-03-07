export enum MultichainActionType {
  TEST_MSG = 'TEST_MSG',
  SET_MK = 'SET_MK',

  // ERROR ACTIONS
  SET_MESSAGE = 'SET_MESSAGE',

  // MODAL ACTIONS
  OPEN_MODAL = 'OPEN_MODAL',
  CLOSE_MODAL = 'CLOSE_MODAL',

  // NAVIGATION ACTIONS
  NAVIGATE_TO = 'NAVIGATE_TO',
  NAVIGATE_TO_WITH_PARAMS = 'NAVIGATE_TO_WITH_PARAMS',
  GO_BACK = 'GO_BACK',
  RESET_NAV = 'RESET_NAV',
  GO_BACK_TO_THEN_NAVIGATE = 'GO_BACK_TO_THEN_NAVIGATE',

  // LOADING
  SET_LOADING = 'SET_LOADING',
  ADD_TO_LOADING_LIST = 'ADD_TO_LOADING_LIST',
  REMOVE_FROM_LOADING_LIST = 'REMOVE_FROM_LOADING_LIST',
  ADD_CAPTION_TO_LOADING_PAGE = 'ADD_CAPTION_TO_LOADING_PAGE',
  ADD_LOADING_PERCENTAGE = 'ADD_LOADING_PERCENTAGE',

  // TITLE CONTAINER
  SET_TITLE_PROPERTIES = 'SET_TITLE_PROPERTIES',
  RESET_TITLE_PROPERTIES = 'RESET_ACTION_PROPERTIES',

  SET_HAS_FINISHED_SIGNUP = 'SET_HAS_FINISHED_SIGNUP',
}
