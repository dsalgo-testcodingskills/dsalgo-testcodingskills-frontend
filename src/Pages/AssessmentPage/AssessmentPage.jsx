import Editor from '@monaco-editor/react';
import React, { useEffect, useRef, useState } from 'react';
import { Modal } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';
import Select from 'react-select';
import { toast } from 'react-toastify';
import { CountDownTimer } from '../../components/CountDownTimer/CountDownTimer';
import CustomLoadingAnimation from '../../components/CustomLoadingAnimation';
import CustomToast from '../../components/CustomToast/CustomToast';
import QuestionInstructions from '../../components/QuestionInstructions/QuestionInstructions';
import {
  getPresignedURL,
  GetSampleQuestion,
  getTestByQuestionAPI,
  runTestsAPI,
  savePerodicAnswer,
  submitTestAPI,
  uploadFileInS3,
} from '../../Services/api';
import { useQuery } from '../../Services/helperfunctions';
import './AssessmentPage.scss';

const AssessmentPage = () => {
  const history = useHistory();
  const query = useQuery();

  const {
    selectedTest: { _id, emailId },
    userImage,
  } = useSelector((store) => store.dataReducer);
  const { qid } = useParams();
  const [options, setOptions] = useState([]);
  const [testCases, setTestCases] = useState([]);

  const selectedLanguageForAPI = useRef();
  const [selectedLanguage, setSelectedLanguage] = useState();
  const [Loading, SetLoading] = useState(false);

  const code = useRef();
  const [test, setTest] = useState();
  const [question, setQuestion] = useState();
  const [testResult, setTestResult] = useState();
  const [result, setResult] = useState();
  const [error, setError] = useState();
  const { testExpiryTime } = useSelector((store) => store.dataReducer);
  const questionDataRef = useRef(null);
  const monacoRef = useRef(null);

  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);

  const goFullScreen = () => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.msRequestFullscreen) {
      elem.msRequestFullscreen();
    } else if (elem.mozRequestFullScreen) {
      elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen();
    }
  };

  const submitTest = async () => {
    try {
      SetLoading(true);

      await submitTestAPI({
        testId: test._id,
        code: code.current,
        emailId: test.emailId,
        questionId: question.question._id,
        language: selectedLanguage.value,
      });
      setResult('Saved successfully!!!');

      history.push(`/student/question/${_id}`);
    } catch (error) {
      setError(error);
      setTimeout(() => {
        setError();
      }, 10000);
    } finally {
      SetLoading(false);
    }
  };

  const runTests = async (question) => {
    try {
      SetLoading(true);
      setError();
      const resp = await runTestsAPI({
        testId: _id,
        code: code.current,
        emailId: emailId,
        questionId: question.question._id,
        language: selectedLanguageForAPI.current?.value,
        sampleQuestion: question?.question.sampleQuestion,
      });
      setTestResult(resp.data);

      if (userImage) {
        submitPeriodicAnswerFunc();
      }
    } catch (error) {
      setError(error);
    } finally {
      SetLoading(false);
    }
  };

  const dataURLtoFile = (dataurl, filename) => {
    var arr = dataurl.split(','),
      mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]),
      n = bstr.length,
      u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  const submitPeriodicAnswerFunc = async () => {
    try {
      const signedUrlResponse = await getPresignedURL({
        contentType: 'image/jpeg',
        path: `tests/${_id}${new Date().getTime()}.jpg`,
      });

      const imgURL =
        signedUrlResponse.data.url + '/' + signedUrlResponse.data.fields['key'];
      const request = {
        questionId: questionDataRef.current?.id,
        testId: _id,
        code: code.current,
        language: selectedLanguageForAPI.current?.value,
        imgURL,
      };

      savePerodicAnswer(request);

      const formData = new FormData();
      Object.keys(signedUrlResponse.data.fields).forEach((key) => {
        formData.append(key, signedUrlResponse.data.fields[key]);
      });
      const image = dataURLtoFile(userImage, 'item');
      // Actual file has to be appended last.
      formData.append('file', image);
      await uploadFileInS3(signedUrlResponse.data.url, formData).catch(() => {
        // throw new Error('Error while uploading image');
      });

    } catch (error) {
      // toast(<CustomToast type="error" message={error.message} />);
    }
  };

  const initTest = async () => {
    try {
      SetLoading(true);
      let result,
        sq = query.get('samplequestion');

      if (sq) {
        result = await GetSampleQuestion();
      } else {
        result = await getTestByQuestionAPI(_id, { questionId: qid });
      }

      const testLocal = result.data;
      setTest(testLocal);
      const questionLocalStorage = sq ? result.data[0] : testLocal.questions[0];
      if (questionLocalStorage && questionLocalStorage.status === 'completed') {
        history.goBack();
      }
      questionDataRef.current = questionLocalStorage;
      setQuestion(questionLocalStorage);
      const optionsList = (
        questionLocalStorage?.question.sampleQuestion
          ? questionLocalStorage?.question?.sampleCode
          : questionLocalStorage?.question?.solutionTemplates
      ).map((sample) => {
        return {
          value: sample.language,
          label: sample.language.toUpperCase(),
          code: sample.code,
        };
      });

      setTestCases(questionLocalStorage?.question?.testCases);
      setOptions(optionsList);

      const lastAnswer = questionLocalStorage.answer.pop();

      let lastOption;

      if (lastAnswer) {
        questionLocalStorage.answer.push(lastAnswer);
        lastOption = optionsList.find((x) => x.value === lastAnswer.language);
      }

      selectedLanguageForAPI.current = lastOption || optionsList[0];
      setSelectedLanguage(lastOption || optionsList[0]);

      code.current = lastAnswer?.code || optionsList[0].code;
    } catch (error) {
      toast(<CustomToast type="error" message={error.message} />);
    } finally {
      SetLoading(false);
    }
  };

  const handleEditorChange = (value) => {
    code.current = value;
  };

  const getTests = async () => {
    await initTest();
  };

  useEffect(() => {
    goFullScreen();
    getTests();
    return () => {
      if (monacoRef.current) monacoRef.current.onKeyUp = null;
    };
  }, []);

  useEffect(() => {
    if (
      userImage &&
      question &&
      question.question &&
      !question.question.sampleQuestion
    ) {
      submitPeriodicAnswerFunc();
    }
  }, [userImage]);

  const onComplete = () => {
    console.log('complete');
    submitTest();
  };

  const handleEditor = (editor) => {
    monacoRef.current = editor;

     editor.onKeyDown((event) => {
       const { keyCode, ctrlKey, metaKey } = event;
       if ((keyCode === 33 || keyCode === 52) && (metaKey || ctrlKey)) {
         event.preventDefault();
       }
     });
    editor.onKeyUp((event) => {
      if (event.ctrlKey && event.code == 'Enter' && questionDataRef.current) {
        runTests(questionDataRef.current);
      }
    });
  };

  return (
    <div className=" assessmentPage disable-copy my-4">
      <div className="d-flex justify-content-start align-items-center">
        <div className="flex-grow-1">
          <button
            className="btns btns--white ms-3"
            onClick={() => history.goBack()}
          >
            <i className="fas fa-arrow-left"></i>&nbsp;&nbsp;Go Back
          </button>
        </div>
        <div className="assessmentPage__time flex-grow-1 text-danger d-flex justify-content-end px-4">
          Timer :&nbsp;
          <CountDownTimer expiryTime={testExpiryTime} onComplete={onComplete} />
        </div>
      </div>
      <div className="assessmentPage__card  m-3  ">
        <div className="row">
          <div
            className="assessmentPage__left col-md-6 col-sm-12"
            style={{ padding: '30px 35px' }}
          >
            <div>
              <QuestionInstructions
                question={question?.question}
                showInstructions={true}
              />
              <div className="mt-3">
                <h5 className=" mb-2">Test Cases</h5>
                {testCases.map((ele, index) => {
                  return (
                    <div className={`card p-3`} key={index}>
                      {!ele.hidden && (
                        <>
                          <div className="status-text">
                            <div>
                              <h6>Test Case {index + 1}</h6>
                            </div>
                            <div
                              className="assessmentPage__left--testCases"
                              style={{ color: '#808081' }}
                            >
                              <div>
                                Input: <br />
                                {ele.input.map((item, itemIndex) => {
                                  return (
                                    <span key={itemIndex}>
                                      {item.toString().split(',').join(' ')}
                                      <br />
                                    </span>
                                  );
                                })}
                              </div>
                              <div>
                                Expected Output:
                                <br />{' '}
                                {ele.output.toString().split(',').join(' ')}
                              </div>
                              {testResult && (
                                <div
                                  className={`${
                                    testResult && testResult[index]?.result
                                      ? 'text-success'
                                      : ''
                                  } ${
                                    testResult && !testResult[index]?.result
                                      ? 'text-danger'
                                      : ''
                                  }`}
                                >
                                  Output:
                                  <br /> {testResult[index]?.actualOutput}
                                </div>
                              )}
                              <textarea
                                value={
                                  typeof testResult === 'object'
                                    ? testResult[index]?.logs
                                    : testResult
                                }
                                hidden={
                                  testResult === undefined
                                    ? true
                                    : false || testResult[index]?.logs == ''
                                    ? true
                                    : false
                                }
                                className="testcase-output mt-2 border p-2 col-12 "
                              ></textarea>
                            </div>
                          </div>
                        </>
                      )}

                      {ele.hidden && (
                        <div className="assessmentPage__hidden">
                          <div>
                            <h6>Test Case {index + 1}</h6>
                          </div>
                          <div className="assessmentPage__hidden--btn  ">
                            <span style={{ zIndex: '10' }}> Hidden</span>
                          </div>
                        </div>
                      )}
                      {testResult && testResult[index] && (
                        <div className="status-badge">
                          <div
                            className={` text-uppercase  ${
                              testResult[index].result
                                ? 'assessmentPage__pass--badge'
                                : 'assessmentPage__fail--badge'
                            }`}
                          >
                            {testResult[index].result ? 'Pass' : 'Fail'}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="col-md-6 col-sm-12" style={{ padding: '30px 35px' }}>
            <div className="row d-flex mb-3 justify-content-between">
              <div className="mt-3 d-flex justify-content-center col-6">
                <button
                  className="btns me-auto"
                  onClick={() => runTests(question)}
                >
                  Save test & Run
                </button>
              </div>
              <div className="col-6 mt-3 " style={{ paddingRight: '20px' }}>
                <Select
                  placeholder="Select Language"
                  options={options}
                  value={selectedLanguage}
                  onChange={(e) => {
                    setSelectedLanguage(e);
                    selectedLanguageForAPI.current = e;
                    code.current = e.code;
                  }}
                />
              </div>
            </div>
            <CustomLoadingAnimation isLoading={Loading} />

            <Editor
              onMount={handleEditor}
              height={testResult === undefined ? '70vh' : '70vh'}
              theme="vs-dark"
              language={selectedLanguage?.value}
              value={code.current}
              onChange={handleEditorChange}
              options={{
                minimap: {
                  enabled: false,
                },
                tabSize: 2,
                wordWrap: 'on',
                formatOnType: true,
              }}
              className="border"
            />
            <div className="mt-2 sucess">{result}</div>
            <div className="mt-2 text-danger">{error}</div>
          </div>
        </div>
      </div>

      {/* Modal opening */}

      <Modal
        size="lg"
        show={show}
        onHide={handleClose}
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>Submit Test</Modal.Title>
        </Modal.Header>
        <Modal.Body className="my-5 text-center">
          Are you sure you want to submit this test?
        </Modal.Body>
        <Modal.Footer className="d-flex justify-content-center">
          <button className="btns btns--white" onClick={handleClose}>
            Cancel
          </button>
          <button
            className="btns"
            onClick={() => {
              submitTest();
              handleClose();
            }}
          >
            Submit
          </button>
        </Modal.Footer>
      </Modal>

      {/* Modal closing */}
    </div>
  );
};

export default AssessmentPage;
