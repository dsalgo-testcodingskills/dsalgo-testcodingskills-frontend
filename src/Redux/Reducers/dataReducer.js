const DEFAULT_STATE = {
  webCam: true,
  selectedTest: undefined,
  tokenData: undefined,
  isStudent: false,
  registrationComplete: null,
  verificationComplete: null,
  testExpiryTime: null,
  userImage: null,
  testsCount: 0,
  loginData: undefined,
  filterForTest: {
    page: 1,
    limit: 10,
    filter: {},
  },
  filterForMultiTest: {
    page: 1,
    limit: 10,
    filter: {},
  },
  customQuestionFilter: {
    page: 1,
    limit: 10,
  },
  webCamStatus: true,
};

const dataReducer = (state = DEFAULT_STATE, action) => {
  switch (action.type) {
    case 'WEB_CAM':
      return {
        ...state,
        webCam: action.payload,
      };
    case 'SELECTED_TEST':
      return {
        ...state,
        selectedTest: action.payload,
      };
    case 'USER_IMAGE':
      return {
        ...state,
        userImage: action.payload,
      };
    case 'TOKEN_DATA':
      return {
        ...state,
        tokenData: action.payload,
      };
    case 'REGISTRATION_COMPLETE':
      return {
        ...state,
        registrationComplete: action.payload,
      };
    case 'VERIFICATION_COMPLETE':
      return {
        ...state,
        verificationComplete: action.payload,
      };
    case 'IS_STUDENT':
      return {
        ...state,
        isStudent: action.payload,
      };
    case 'SET_EXPIRY':
      return {
        ...state,
        testExpiryTime: action.payload,
      };
    case 'SET_TESTS_COUNT':
      return {
        ...state,
        testsCount: action.payload,
      };
    case 'LOGIN_DATA':
      return {
        ...state,
        loginData: action.payload,
      };
    case 'SET_FILTER_FOR_TEST':
      return {
        ...state,
        filterForTest: action.payload,
      };
    case 'SET_CUSTOM_QUESTION_FILTER':
      return {
        ...state,
        customQuestionFilter: action.payload,
      };
    case 'SET_MULTI_FILTER':
      return {
        ...state,
        filterForMultiTest: action.payload,
      };
    case 'LOGOUT_DATA':
      return {
        ...state,
        loginData: undefined,
        tokenData: undefined,
        verificationComplete: null,
      };
    case 'SET_WEBCAM_STATUS':
      return {
        ...state,
        webCamStatus: action.payload,
      };
    default:
      return state;
  }
};

export default dataReducer;
