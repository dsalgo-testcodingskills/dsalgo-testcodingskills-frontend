import Editor from '@monaco-editor/react';
import Slider, { SliderTooltip } from 'rc-slider';
import React, { useEffect, useRef, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import Select from 'react-select';
import { toast } from 'react-toastify';
import CustomLoadingAnimation from '../../components/CustomLoadingAnimation';
import CustomToast from '../../components/CustomToast/CustomToast';
import QuestionInstructions from '../../components/QuestionInstructions/QuestionInstructions';
import { getTestByQuestionAPI, runTestsAPI } from '../../Services/api';
import '../AssessmentPage/AssessmentPage.scss';

const SolutionsReview = () => {
  const history = useHistory();
  const { testId, qid } = useParams();

  const [ArrayLength, SetArrayLength] = useState(0);
  const [codeArraylength, setcodeArraylength] = useState(0);
  const [options, setOptions] = useState([]);
  const [testCases, setTestCases] = useState([]);

  const selectedLanguageForAPI = useRef();
  const [selectedLanguage, setSelectedLanguage] = useState();
  const [Loading, SetLoading] = useState(false);

  const code = useRef();
  const [test, setTest] = useState();
  const [question, setQuestion] = useState();
  const [testResult, setTestResult] = useState();
  const [error, setError] = useState();

  const runTests = async () => {
    try {
      SetLoading(true);
      setError();
      const resp = await runTestsAPI({
        testId: test._id,
        code: code.current,
        emailId: test.emailId,
        questionId: question.id,
        language: selectedLanguage.value,
      });
      setTestResult(resp.data);
    } catch (error) {
      setError(error);
    } finally {
      SetLoading(false);
    }
  };

  const initTest = async () => {
    try {
      SetLoading(true);

      const result = await getTestByQuestionAPI(testId, {
        questionId: qid,
        admin: true,
      });

      const testLocal = result.data;
      setTest(testLocal);

      const questionLocalStorage = testLocal.questions.find(
        (q) => q.id === qid,
      );
      const CodeArray = questionLocalStorage.answer;

      if (CodeArray.length) {
        SetArrayLength(CodeArray.length - 1);
        setcodeArraylength(CodeArray.length - 1);
      }
      setQuestion(questionLocalStorage);
      const optionsList = questionLocalStorage?.question?.solutionTemplates.map(
        (sample) => {
          return {
            value: sample.language,
            label: sample.language.toUpperCase(),
            code: sample.code,
          };
        },
      );

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

      code.current = lastAnswer?.code || optionsList[0]?.code;
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
    initTest();
  }, []);


  const { Handle } = Slider;
  const handle = (props) => {
    const { value, dragging, index, ...restProps } = props;
    return (
      <SliderTooltip
        prefixCls="rc-slider-tooltip"
        overlay={`${value} %`}
        visible={dragging}
        placement="top"
        key={index}
      >
        <Handle value={value} {...restProps} />
      </SliderTooltip>
    );
  };

  const wrapperStyle = { width: 400 };

  return (
    <div className="" style={{ margin: '30px 120px' }}>
      <div className="d-flex justify-content-start">
        <button className="btns btns--white" onClick={() => history.goBack()}>
          <i className="fas fa-arrow-left"></i>&nbsp;&nbsp;Go Back
        </button>
      </div>
      <div
        className=" mt-4 assessmentPage__card"
        style={{ padding: '30px 35px' }}
      >
        <div className="row p-2">
          <h4 className="my-auto" style={{ fontSize: '21px', fontWeight: 700 }}>
            {test?.emailId
              ? test?.emailId
              : test?.phone
              ? test?.phone
              : 'No Data Available'}{' '}
          </h4>
        </div>
        <div className="row">
          <div className="col-md-6 col-sm-12">
            <div>
              <QuestionInstructions
                question={question?.question}
                showInstructions={true}
              />
              <div className="mt-3">
                <h5 className=" mb-2">Test Cases</h5>
                {testCases.map((ele, index) => {
                  return (
                    <div
                      className={`d-flex mt-2 border p-2  ${
                        testResult && testResult[index].result
                          ? 'text-success'
                          : ''
                      } ${
                        testResult && !testResult[index].result
                          ? 'text-danger'
                          : ''
                      }`}
                      key={index}
                    >
                      <div className="status-text">
                        <div>
                          <h6>Test Case {index + 1}</h6>
                        </div>
                        <div style={{ color: '#808081' }}>
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
                        <div style={{ color: '#808081' }}>
                          Output:
                          <br /> {ele.output.toString().split(',').join(' ')}
                        </div>

                        <textarea
                          value={
                            typeof testResult === 'object'
                              ? testResult[index].logs
                              : testResult
                          }
                          hidden={
                            testResult === undefined
                              ? true
                              : testResult[index].hidden
                              ? true
                              : false
                          }
                          className="testcase-output mt-2 border p-2 col-12"
                        ></textarea>
                      </div>
                      {testResult && testResult[index] && (
                        <div className="status-badge">
                          <div
                            className={`badge text-uppercase ${
                              testResult[index].result
                                ? 'status-badge-success'
                                : 'status-badge-fail'
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
          <div
            className="col-md-6 col-sm-12 
            test-case-style"
          >
            <div className="row d-flex justify-content-between">
              <div className="col-8 img-container">
                {test?.questions[0]?.answer[codeArraylength]?.imgurl ? (
                  <img
                    src={`${test?.questions[0]?.answer[codeArraylength]?.imgurl}`}
                    alt="userimage"
                  />
                ) : (
                  <>
                    <div className="no-img">
                      <span>No image</span>
                    </div>
                  </>
                )}
              </div>
              <div className="col-4">
                <Select
                  className="mb-3"
                  placeholder="Select Language"
                  isDisabled
                  options={options}
                  value={selectedLanguage}
                  onChange={(e) => {
                    setSelectedLanguage(e);
                    selectedLanguageForAPI.current = e;
                    code.current = e?.code;
                  }}
                />
              </div>
            </div>
            <CustomLoadingAnimation isLoading={Loading} />

            <Editor
              height={testResult === undefined ? '70vh' : '70vh'}
              theme="vs-dark"
              language={selectedLanguage?.value}
              value={
                test?.questions[0].answer.length > 0
                  ? test?.questions[0].answer[codeArraylength]?.code
                  : '//No code written by Candidate'
              }
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

            <div className="container my-3 d-flex justify-content-center">
              <div style={wrapperStyle}>
                <Slider
                  min={0}
                  max={ArrayLength}
                  value={codeArraylength}
                  step={1}
                  handleStyle={{
                    borderWidth: 5,
                    borderColor: 'gray',
                  }}
                  railStyle={{ backgroundColor: 'orange' }}
                  trackStyle={{ backgroundColor: 'gray', height: 5 }}
                  onChange={setcodeArraylength}
                  handle={handle}
                />
              </div>
            </div>

            <div className="mt-3 d-flex justify-content-center">
              <button
                className="btn btn-secondary rounded-pill px-4"
                onClick={runTests}
                disabled={question?.answer?.length === 0}
              >
                Run Test Cases
              </button>
            </div>

            <div className="mt-2 text-danger">{error}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SolutionsReview;
