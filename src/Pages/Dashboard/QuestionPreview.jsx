import Editor from '@monaco-editor/react';
import React, { useEffect, useRef, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import Select from 'react-select';
import { toast } from 'react-toastify';
import CustomLoadingAnimation from '../../components/CustomLoadingAnimation';
import CustomToast from '../../components/CustomToast/CustomToast';
import QuestionInstructions from '../../components/QuestionInstructions/QuestionInstructions';
import { getQuestionTemplatesTypes, previewCustomQuestion } from '../../Services/api';
import '../../Pages/AssessmentPage/AssessmentPage.scss';


const QuestionPreview = () => {
  const history = useHistory();
  const location = useLocation();
  const questionData = location.state?.question;

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

  const generateBoilerplate = (lang, qData) => {
    if (!qData) return "";
    const { inputType, outputType } = qData;
    const params = inputType?.map(it => it.paramName).join(", ") || "";

    const instructions = `//Write your code only in provided function\n//Dont write any of your code outside this function\n//Function will be executed with inputs from test cases on run test cases\n\n`;

    const getLanguageType = (type, l) => {
      const typeMap = {
        javascript: { int: "number", boolean: "boolean", array_int: "number[]", array_char: "string[]", "2d_array_int": "number[][]", "2d_array_char": "string[][]" },
        python: { int: "int", boolean: "bool", array_int: "List[int]", array_char: "List[str]", "2d_array_int": "List[List[int]]", "2d_array_char": "List[List[str]]" },
        java: { int: "int", boolean: "boolean", array_int: "int[]", array_char: "char[]", "2d_array_int": "int[][]", "2d_array_char": "char[][]" },
        cpp: { int: "int", boolean: "bool", array_int: "vector<int>", array_char: "vector<char>", "2d_array_int": "vector<vector<int>>", "2d_array_char": "vector<vector<char>>" },
        go: { int: "int", boolean: "bool", char: "byte", string: "string", array_int: "[]int", array_char: "[]byte", array_string: "[]string", array_boolean: "[]bool", "2d_array_int": "[][]int", "2d_array_char": "[][]byte", "2d_array_string": "[][]string", "2d_array_boolean": "[][]bool" },
      };
      return typeMap[l]?.[type] || type;
    };

    switch (lang) {
      case "javascript":
        return `function solution(${params}){\n ${instructions}}`;
      case "python":
        const pyInstructions = instructions.replace(/\/\//g, "#");
        return `def solution(${params}):\n ${pyInstructions}    \n`;
      case "java":
         const javaParams = inputType?.map(it => `${getLanguageType(it.type, "java")} ${it.paramName}`).join(", ") || "";
        return `public static ${getLanguageType(outputType, "java")} solution(${javaParams}) {\n        ${instructions}\n    \n}`;
      case "cpp":
        const cppParams = inputType?.map(it => `${getLanguageType(it.type, "cpp")} ${it.paramName}`).join(", ") || "";
        return `${getLanguageType(outputType, "cpp")} solution(${cppParams}) {\n    ${instructions}\n}`;
        case "go":
    const goParams = inputType?.map(it => `${it.paramName} ${getLanguageType(it.type, "go")}`).join(", ") || "";
    return `func solution(${goParams}) ${getLanguageType(outputType, "go")} {\n\t ${instructions}\n}`;
      default:
        return `// Template for ${lang}\nfunction solve(${params}) {\n  ${instructions}\n}`;
    }
  };

  const initTest = async () => {
    try {
      SetLoading(true);

      const questionLocalStorage = {
        question: questionData,
        answer: [],
      };

      questionDataRef.current = questionLocalStorage;
      setQuestion(questionLocalStorage);

      let templates = [];
      if (
        questionData?.solutionTemplates &&
        questionData.solutionTemplates.length > 0
      ) {
        templates = questionData.solutionTemplates;
      } else if (questionData?.sampleQuestion && questionData?.sampleCode) {
        templates = questionData.sampleCode;
      } else {
        try {
          const res = await previewCustomQuestion(questionData);
          if (res?.data && Array.isArray(res.data)) {
            templates = res.data;
          }
        } catch (apiErr) {
          const fallbackLangs = ['cpp', 'java', 'python', 'javascript', 'go'];
          templates = fallbackLangs.map((lang) => ({
            language: lang,
            code: generateBoilerplate(lang, questionData),
          }));
        }
      }

      const optionsList = templates.map((sample) => {
        return {
          value: sample.language,
          label: sample.language.toUpperCase(),
          code: sample.code || generateBoilerplate(sample.language, questionData),
        };
      });

      setTestCases(questionData?.testCases || []);
      setOptions(optionsList);
      console.log("optionsList",optionsList)

      if (optionsList.length > 0) {
        selectedLanguageForAPI.current = optionsList[0];
        setSelectedLanguage(optionsList[0]);
        code.current = optionsList[0]?.code || '';
      }
      console.log("code", code.current);
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
      initTest();
    }
  }, [questionData]);

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
                                {Array.isArray(ele.input) ? ele.input.map((item, itemIndex) => {
                                  return (
                                    <span key={itemIndex}>
                                      {item.toString().split(',').join(' ')}
                                      <br />
                                    </span>
                                  );
                                }) : ele.input}
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
                                readOnly
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
                  disabled
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
            {/* <AssessmentPage /> */}

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
