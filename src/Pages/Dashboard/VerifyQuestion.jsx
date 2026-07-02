import Editor from "@monaco-editor/react";
import { useEffect, useRef, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import Select from "react-select";
import { toast } from "react-toastify";
import CustomLoadingAnimation from "../../components/CustomLoadingAnimation";
import CustomToast from "../../components/CustomToast/CustomToast";
import QuestionInstructions from "../../components/QuestionInstructions/QuestionInstructions";
import {
  getCustomQuestionById,
  runTestsAPI,
  finalizeDraftQuestion,
} from "../../Services/api";
import "../../Pages/AssessmentPage/AssessmentPage.scss";
import "./VerifyQuestion.scss";
import { formatTestCaseValue } from "../../utils/helper";

const VerifyQuestion = () => {
  const history = useHistory();
  const { draftId } = useParams();

  const [questionData, setQuestionData] = useState(null);
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
  const [hasRun, setHasRun] = useState(false);
  const [creating, setCreating] = useState(false);
  const monacoRef = useRef(null);

  const allTestsPassed =
    testResult?.length > 0 && testResult.every((t) => t.result);

  useEffect(() => {
    if (draftId) {
      fetchDraft();
    }
  }, [draftId]);

  const fetchDraft = async () => {
    try {
      SetLoading(true);
      const res = await getCustomQuestionById(draftId);
      const data = res?.data?.data;
      if (!data) {
        toast(<CustomToast type="error" message="Draft question not found" />);
        history.push("/admin/customQuestion");
        return;
      }
      setQuestionData(data);

      const questionLocalStorage = {
        question: data,
        topics: data.topics || [],
        answer: [],
      };
      setQuestion(questionLocalStorage);

      // Set up solution templates as language options
      if (data.solutionTemplates && data.solutionTemplates.length > 0) {
        const optionsList = data.solutionTemplates.map((sample) => ({
          value: sample.versionName,
          label: sample.versionName || sample.language.toUpperCase(),
          code: sample.code,
          language:sample.language
        }));
        setOptions(optionsList);
        selectedLanguageForAPI.current = optionsList[0];
        setSelectedLanguage(optionsList[0]);
        code.current = optionsList[0]?.code || "";
      }

      // Set test cases
      setTestCases(data.testCases || []);
    } catch (err) {
      toast(
        <CustomToast
          type="error"
          message={err?.message || "Error loading draft"}
        />,
      );
    } finally {
      SetLoading(false);
    }
  };

  const handleEditorChange = (value) => {
    code.current = value;
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
      if (event.ctrlKey && event.code === "Enter") {
        runTests();
      }
    });
  };

  const runTests = async () => {
    try {
      SetLoading(true);
      setError();
      setResult();
      const resp = await runTestsAPI({
        testId: draftId,
        code: code.current,
        questionId: draftId,
        language: selectedLanguageForAPI.current?.language,
        sampleQuestion: false,
        testCases: questionData.testCases,
        inputType: questionData.inputType,
        outputType: questionData.outputType,
        constraints: questionData.constraints,
        outputConstraints: questionData.outputConstraints,
        questionType: questionData.questionType,
        emailId: 'admin-verification', 
      });
      setTestResult(resp.data);
      setHasRun(true);
    } catch (err) {
      if (typeof err === "string") {
        setError(err);
      } else {
        setError(err?.message || "Error running tests");
      }
    } finally {
      SetLoading(false);
    }
  };

  const handleCreateQuestion = async () => {
    try {
      setCreating(true);
      SetLoading(true);
      const res = await finalizeDraftQuestion(draftId);
      if (res?.data?.statusCode === 200) {
        toast(
          <CustomToast
            type="success"
            message="Question created successfully!"
          />,
        );
        history.push("/admin/customQuestion");
      } else {
        toast(
          <CustomToast
            type="error"
            message={res?.data?.message || "Failed to create question"}
          />,
        );
      }
    } catch (err) {
      toast(
        <CustomToast
          type="error"
          message={err?.message || "Error creating question"}
        />,
      );
    } finally {
      setCreating(false);
      SetLoading(false);
    }
  };

  if (!questionData && !Loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="alert alert-warning">Loading draft question...</div>
      </div>
    );
  }

  return (
    <div className="verifyQuestion assessmentPage disable-copy">
      <div className="d-flex justify-content-start align-items-center verifyQuestion__header">
        <div className="flex-grow-1">
          <button
            className="btns btns--white ms-3"
            onClick={() => history.goBack()}
          >
            <i className="fas fa-arrow-left"></i>&nbsp;&nbsp;Go Back
          </button>
        </div>
        <div className="verifyQuestion__header-title">
          <h5 className="mb-0">Verify & Create Question</h5>
        </div>
        <div className="flex-grow-1 d-flex justify-content-end pe-3">
          <button
            className={`btns verifyQuestion__create-btn ${
              !hasRun || !allTestsPassed ? "btns--disabled" : ""
            }`}
            disabled={!hasRun || !allTestsPassed || creating}
            onClick={handleCreateQuestion}
          >
            {creating ? "Creating..." : "Create Question"}
          </button>
        </div>
      </div>

      {!hasRun && (
        <div className="verifyQuestion__info-banner">
          <i className="fas fa-info-circle me-2"></i>
          Write your solution and run the code to verify test cases. You can
          create the question after running the code.
        </div>
      )}

      <div className="assessmentPage__card">
        <div className="row assessment-content-row">
          <div className="assessmentPage__left col-md-6 col-sm-12">
            <div>
              <QuestionInstructions
                question={question?.question}
                showInstructions={true}
              />
              <div className="mt-3">
                <h5>Topics</h5>
                {question?.question?.topics?.length > 0 ? (
                  <div
                    className="d-flex flex-wrap gap-2"
                    style={{ paddingBottom: "10px" }}
                  >
                    {question?.question?.topics?.map((topic, index) => (
                      <span
                        key={index}
                        className="badge bg-primary p-2"
                        style={{
                          fontSize: "14px",
                          fontFamily: "Arial",
                          color: "black",
                        }}
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
                <h5 className="mb-2">Test Cases</h5>
                {testCases.map((ele, index) => {
                  const result = testResult?.[index];
                  return (
                    <div className="card p-3" key={index}>
                      {(!ele.hidden ||
                        (ele.hidden && result && !result.result)) && (
                        <>
                          <div className="status-text">
                            <div>
                              <h6>Test Case {index + 1}</h6>
                            </div>
                            <div
                              className="assessmentPage__left--testCases"
                              style={{ color: "#808081" }}
                            >
                              <div>
                                Input: <br />
                                {Array.isArray(ele.input)
                                  ? ele.input.map((item, itemIndex) => (
                                      <span key={itemIndex}>
                                        <b>{questionData?.inputType?.[itemIndex]?.paramName || `arg${itemIndex + 1}`}:</b>{' '}
                                        {formatTestCaseValue(item, questionData?.inputType?.[itemIndex]?.type)}
                                        <br />
                                      </span>
                                    ))
                                  : ele.input}
                              </div>
                              <div>
                                Expected Output:
                                <br />
                                {formatTestCaseValue(ele.output, questionData?.outputType)}
                              </div>
                              {testResult && (
                                <div
                                  className={`${
                                    result?.result
                                      ? "text-success"
                                      : "text-danger"
                                  }`}
                                >
                                  Output:
                                  <br />
                                  {typeof result?.actualOutput === "object"
                                    ? JSON.stringify(result?.actualOutput)
                                    : formatTestCaseValue(result?.actualOutput?.toString(), questionData?.outputType) || ""}
                                </div>
                              )}
                              <textarea
                                value={result?.logs || ""}
                                hidden={!result || result?.logs === ""}
                                className="testcase-output mt-2 border p-2 col-12"
                                readOnly
                              />
                            </div>
                          </div>
                        </>
                      )}

                      {ele.hidden && (!result || result.result) && (
                        <div className="assessmentPage__hidden">
                          <div>
                            <h6>Test Case {index + 1}</h6>
                          </div>
                          <div className="assessmentPage__hidden--btn">
                            <span style={{ zIndex: "10" }}>Hidden</span>
                          </div>
                        </div>
                      )}

                      {testResult && result && (
                        <div className="status-badge">
                          <div
                            className={`text-uppercase ${
                              result.result
                                ? "assessmentPage__pass--badge"
                                : "assessmentPage__fail--badge"
                            }`}
                          >
                            {result.result ? "Pass" : "Fail"}
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
                <button className="btns me-auto" onClick={runTests}>
                  <i className="fas fa-play me-2"></i>
                  Run Code
                </button>
              </div>
              <div className="col-6 mt-3" style={{ paddingRight: "20px" }}>
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
              height="70vh"
              theme="vs-dark"
              language={selectedLanguage?.value}
              value={code.current}
              onChange={handleEditorChange}
              options={{
                minimap: {
                  enabled: false,
                },
                tabSize: 2,
                wordWrap: "on",
                formatOnType: true,
                padding: {
                  top: 16,
                  bottom: 16,
                },
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

export default VerifyQuestion;
