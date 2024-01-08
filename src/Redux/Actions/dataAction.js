export const webCamToggle = (data) => ({
  type: 'WEB_CAM',
  payload: data,
});

export const setTestsCount = (data) => ({
  type: 'SET_TESTS_COUNT',
  payload: data,
});

export const selectedTestToggle = (data) => ({
  type: 'SELECTED_TEST',
  payload: data,
});

export const tokenDataToggle = (data) => ({
  type: 'TOKEN_DATA',
  payload: data,
});

export const loginToggle = (data) => ({
  type: 'LOGIN_DATA',
  payload: data,
});

export const setFilterForTest = (data) => ({
  type: 'SET_FILTER_FOR_TEST',
  payload: data,
})

export const setCustomQuestionFilter = (data) => ({
  type: 'SET_CUSTOM_QUESTION_FILTER',
  payload: data,
})

export const setFilterForMultiTest = (data) => ({
  type: 'SET_MULTI_FILTER',
  payload: data,
})

export const registrationCompleteToggle = (data) => ({
  type: 'REGISTRATION_COMPLETE',
  payload: data,
});

export const verificationCompleteToggle = (data) => ({
  type: 'VERIFICATION_COMPLETE',
  payload: data,
});

export const isStudentToggle = (data) => ({
  type: 'IS_STUDENT',
  payload: data,
});

export const userImageToggle = (data) => ({
  type: 'USER_IMAGE',
  payload: data,
});

export const setExpiry = (data) => ({
  type: 'SET_EXPIRY',
  payload: data,
});

export const setLogout = () => ({
  type: 'LOGOUT_DATA',
});

export const webCamStatusUpdate = (data) => ({
  type: 'SET_WEBCAM_STATUS',
  payload: data,
});
