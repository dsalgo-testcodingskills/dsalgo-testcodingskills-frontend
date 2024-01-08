import axios from './axios'; // importing axios from customAxios

export function getTestAPI(id, params) {
  return axios.get(`/test/${id}`, { params });
}

export function getQuestionList() {
  return axios.get('/compiler/questions');
}

export function getQuestionDetailsAPI(id) {
  return axios.get(`/compiler/questionDetails/${id}`);
}

export function savePerodicAnswer(request) {
  return axios.post('/test/savePerodicAnswer', request);
}

export function getPresignedURL(request) {
  return axios.post('/test/getPresignedURL', request);
}

export function uploadFileInS3(url, file) {
  return axios({
    method: 'post',
    url,
    data: file,
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}

export function runTestsAPI(request) {
  return axios.post('/compiler/compileCode', request);
}

export function submitTestAPI(request) {
  return axios.post('/test/submit', request);
}

export function getTestByQuestionAPI(testId, params) {
  return axios.get(`/test/answer/${testId}`, { params });
}

export function createOrganization(request) {
  return axios.post('/authentication/register', request);
}

export function updateCognitoOrganization(request) {
  return axios.post('/test/updateCognitoOrganization', request);
}

export function codeVerification(request) {
  return axios.post('/authentication/verifyCode', request);
}

export function resendCode(request) {
  return axios.post('/authentication/resendVerifyCode', request);
}

export function AuthenticateUser(request) {
  return axios.post('/authentication/authenticateUser', request);
}

export function createUser(request) {
  return axios.post('/user/create-user', request);
}

export function deleteuser(request) {
  return axios.post('/authentication/deleteuser', request);
}

export function getUsers(request) {
  return axios.post('/user/find-users', request);
}

export function updateUser(request) {
  return axios.patch('/user/update-user', request);
}

export function updateOrganisation(body) {
  return axios.patch('/user/organisation', body);
}

export function getUserInfo() {
  return axios.post('/user/getUserInfo');
}

export function changepassword(request) {
  return axios.post('/user/change-password', request);
}

export function getallTestSubmissions(request) {
  return axios.post('/test/getalltest', request);
}

export function getallMultiTestSubmissions(Id, filters) {
  return axios.post(`/test/MultiLinkTestDetails/${Id}`, filters);
}

export function createTest(request) {
  return axios.post('/test/create', request);
}

export function createMultiTest(request) {
  return axios.post('/test/MultiLinkcreate', request);
}

export function submitStudentForm(request, testId) {
  return axios.post(`/test/UserINFO/${testId}`, request);
}

export function TestStarted(id) {
  return axios.post(`/test/started/${id}`);
}

export function endTest(id) {
  return axios.post(`/test/endtest/${id}`);
}

export function ResendEmail(id) {
  return axios.get(`/test/resendEmail/${id}`);
}

export function ShortlistStudent(request) {
  return axios.post('/test/shortlist', request);
}

export function GetSampleQuestion() {
  return axios.get('/test/getsamplequestion');
}

export function GetAllQuestions(body) {
  return axios.post('/questions/getQuestion', body);
}

export function getallCustomQuestions(request) {
  return axios.post('/questions/getallcustomquestion', request);
}

export function sendForgotPasswordVerificationCode(body) {
  return axios.post('/authentication/forgotPassword', body);
}

export function verifyForgotPasswordVerificationCode(body) {
  return axios.post('/authentication/confirmForgotPassword', body);
}

export function GetTotalTestsCount() {
  return axios.get('/test/testsCount');
}

export function createSubscription(body) {
  return axios.post('/payment/createSubscription', body);
}

export function getAllPlans() {
  return axios.get('/payment/getAllPlans');
}
export function getSubDetails() {
  return axios.get('/payment/getSubscriptionDetails');
}

export function getPaymentDetails() {
  return axios.get('/payment/getPaymentDetails');
}

export function updatePaymentStatus() {
  return axios.patch('/payment/updateSubscriptionDetails');
}

export function cancelSubscriptions() {
  return axios.post('/payment/cancelSubscription');
}

export function getQuestionTemplatesTypes() {
  return axios.get('/questions/getQuestionTemplateForCustomQuestion');
}

export function submitCustomQuestion(body) {
  return axios.post('/questions/createCustomQuestion', body);
}

export function checkEmail(body) {
  return axios.post('/authentication/checkEmail', body);
}
export function getOrgDetails() {
  return axios.post('/test/getOrgDetails');
}

export function checkEmailCognito() {
  return axios.post('/test/verifyEmail');
}

export function updateOrgDb(body) {
  return axios.post('/authentication/updateProfileUrl', body);
}

export function logOut() {
  return axios.post('/test/logOut');
}
export function getCustomQuestions(body) {
  return axios.post('/questions/custom-question-find', body);
}

export function editCustomQuestions(id, request) {
  return axios.patch(`/questions/updateCustomQuestion/${id}`, request);
}

export function getCustomQuestionById(id) {
  return axios.get(`/questions/${id}`);
}

export function updateUserPass(body) {
  return axios.post('/authentication/loginNewuser', body);
}

export function studentOrgDetails(id) {
  return axios.get(`/test/studentOrgDetails/${id}`);
}
