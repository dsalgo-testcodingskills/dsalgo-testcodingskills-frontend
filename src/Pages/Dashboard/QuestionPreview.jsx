import Editor from '@monaco-editor/react';
import React, { useEffect, useRef, useState } from 'react';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import Select from 'react-select';
import { toast } from 'react-toastify';
import CustomLoadingAnimation from '../../components/CustomLoadingAnimation';
import CustomToast from '../../components/CustomToast/CustomToast';
import QuestionInstructions from '../../components/QuestionInstructions/QuestionInstructions';
import { getQuestionTemplatesTypes, previewCustomQuestion, GetAllQuestions } from '../../Services/api';
import '../../Pages/AssessmentPage/AssessmentPage.scss';


const QuestionPreview = ({ questionId: propQuestionId, questionData: propQuestionData, isModal }) => {
  const history = useHistory();
  const location = useLocation();
  const { questionId: paramQuestionId } = useParams();
  const questionId = propQuestionId || paramQuestionId;
  const [questionData, setQuestionData] = useState(propQuestionData || location.state?.question);

  const [options, setOptions] = useState([]);
  const [testCases, setTestCases] = useState([]);

  const selectedLanguageForAPI = useRef();
  const [selectedLanguage, setSelectedLanguage] = useState();
  const [Loading, SetLoading] = useState(false);

  const code = useRef();
  const [question, setQuestion] = useState();
  const [testResult, setTestResult] = useState();
  const [result, setResult] = useState();
  const [error, setError] = useState();
  const questionDataRef = useRef(null);
  const monacoRef = useRef(null);

  const initTest = async (data) => {
    try {
      SetLoading(true);

      const questionLocalStorage = {
        question: data,
        topics: data.topics || [],
        answer: [],
      };

      questionDataRef.current = questionLocalStorage;
      setQuestion(questionLocalStorage);

      let templates = [];
      
      const setOptionsFromTemplates = (tempTemplates) => {
        const optionsList = tempTemplates.map((sample) => {
          return {
            value: sample.language,
            label: sample.language.toUpperCase(),
            code: sample.code,
          };
        });
        setOptions(optionsList);
        if (optionsList.length > 0) {
          if (!selectedLanguageForAPI.current) {
            selectedLanguageForAPI.current = optionsList[0];
            setSelectedLanguage(optionsList[0]);
            code.current = optionsList[0]?.code || '';
          } else {
            const updatedSelected = optionsList.find(o => o.value === selectedLanguageForAPI.current.value);
            if (updatedSelected) {
              setSelectedLanguage(updatedSelected);
              code.current = updatedSelected.code;
            }
          }
        }
      };

      if (
        data?.solutionTemplates &&
        data.solutionTemplates.length > 0
      ) {
        templates = data.solutionTemplates;
        setOptionsFromTemplates(templates);
        setTestCases(data?.testCases || []);
      } else if (data?.sampleQuestion && data?.sampleCode) {
        templates = data.sampleCode;
        setOptionsFromTemplates(templates);
        setTestCases(data?.testCases || []);
      } else {
        try {
          const res = await previewCustomQuestion(data);
          if (res?.data?.data) {
            if (Array.isArray(res.data.data.solutionTemplates)) {
              templates = res.data.data.solutionTemplates;
              setOptionsFromTemplates(templates);
            }
            if (Array.isArray(res.data.data.testCases)) {
              setTestCases(res.data.data.testCases);
            }
          }
        } catch (apiErr) {
           console.error("API preview failed", apiErr);
           toast(<CustomToast type="error" message="Failed to load preview templates." />);
        }
      }
    } catch (error) {
      toast(<CustomToast type="error" message={error.message} />);
    } finally {
      SetLoading(false);
    }
  };

  const handleEditorChange = (value) => {
    code.current = value;
  };

  useEffect(() => {
    if (questionData) {
      initTest(questionData);
    } else if (questionId) {
      const fetchQuestion = async () => {
        try {
          SetLoading(true);
          const res = await GetAllQuestions({ questionId });
          const fetchedData = res?.data?.data?.[0];
          if (fetchedData) {
            setQuestionData(fetchedData);
          } else {
            toast(<CustomToast type="error" message="Question not found" />);
          }
        } catch (err) {
          toast(<CustomToast type="error" message={err?.message || "Error fetching question"} />);
        } finally {
          SetLoading(false);
        }
      };
      fetchQuestion();
    }
  }, [questionData, questionId]);

  const handleEditor = (editor) => {
    monacoRef.current = editor;

    editor.onKeyDown((event) => {
      const { keyCode, ctrlKey, metaKey } = event;
      if ((keyCode === 33 || keyCode === 52) && (metaKey || ctrlKey)) {
        event.preventDefault();
      }
    });
    editor.onKeyUp((event) => {
      if (event.ctrlKey && event.code == 'Enter') {
        // Disabled for preview
      }
    });
  };

  if (!questionData) {
    return (
      <div className="container mt-5 text-center">
        <div className="alert alert-warning">No question data found for preview.</div>
        <button className="btns" onClick={() => history.goBack()}>Go Back</button>
      </div>
    );
  }

  return (
    <div className={`${isModal ? "" : "assessmentPage"} disable-copy my-4`}>
    {!isModal && (
      <div className="d-flex justify-content-start align-items-center">
        <div className="flex-grow-1">
          <button
            className="btns btns--white ms-3"
            onClick={() => history.goBack()}
          >
            <i className="fas fa-arrow-left"></i>&nbsp;&nbsp;Go Back
          </button>
        </div>
      </div>
    )}
      <div className={`${isModal ? "" : "assessmentPage__card"}`}>
        <div className="row assessment-content-row">
          <div className="assessmentPage__left col-md-6 col-sm-12">
            <div>
              <QuestionInstructions
                question={question?.question}
                showInstructions={true}
              />
              <div className="mt-3">
                <h5>Topics</h5>
                {question?.topics?.length > 0 ? (
                  <div className="d-flex flex-wrap gap-2" style={{ paddingBottom: '10px' }}>
                    {question?.topics?.map((topic, index) => (
                      <span
                        key={index}
                        className="badge bg-primary p-2"
                        style={{ fontSize: '14px', fontFamily: 'Arial', color: 'black' }}
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted">No topics added</p>
                )}
              </div>
              <div className="mt-3">
                <h5 className=" mb-2">Test Cases</h5>
                {testCases.map((ele, index) => {
                  return (
                    <div className={`card p-3`} key={index}>
                      {(!ele.hidden || (ele.hidden && testResult && testResult[index] && !testResult[index].result)) && (
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
                                {Array.isArray(ele.input)
                                  ? ele.input.map((item, itemIndex) => {
                                      return (
                                        <span key={itemIndex}>
                                          {item?.toString().split(',').join(' ') || ''}
                                          <br />
                                        </span>
                                      );
                                    })
                                  : ele.input}
                              </div>
                              <div>
                                Expected Output:
                                <br />{' '}
                                {ele.output?.toString().split(',').join(' ') || ''}
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
                                readOnly
                              ></textarea>
                            </div>
                          </div>
                        </>
                      )}

                      {(ele.hidden && (!testResult || !testResult[index] || testResult[index].result)) && (
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
          <div className="col-md-6 col-sm-12 scrollable-column">
            <div className="row d-flex mb-3 justify-content-between">
              <div className="mt-3 d-flex justify-content-center col-6">
                <button
                  className="btns me-auto"
                  disabled
                  style={{ cursor: "not-allowed", pointerEvents: "all" }}
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
    </div>
  );
};

export default QuestionPreview;
