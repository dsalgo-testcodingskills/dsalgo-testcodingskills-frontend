import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import './CreateTest.scss';
import '../AssessmentPage/AssessmentPage.scss';
import { GetAllQuestions } from '../../Services/api';
import { toast } from 'react-toastify';
import CustomToast from '../../components/CustomToast/CustomToast';
import CustomLoadingAnimation from '../../components/CustomLoadingAnimation';
import QuestionInstructions from '../../components/QuestionInstructions/QuestionInstructions';
import { formatTestCaseValue } from '../../utils/helper';

const Question = () => {
  console.log("inside question page");
  
  const { questionId } = useParams();
  const [testCases, setTestCases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState();

  const initTest = async () => {
    try {
      setLoading(true);
      const result = await GetAllQuestions({ questionId });

      const testLocal = result?.data?.data?.[0];

      if (testLocal) {
        setQuestion(testLocal);
        setTestCases(testLocal?.testCases || []);
      } else {
        toast(<CustomToast type="error" message="Question not found" />);
      }
    } catch (error) {
      toast(<CustomToast type="error" message={error?.message || error || 'Error fetching question'} />);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (questionId) {
      initTest();
    }
  }, [questionId]);

  return loading ? (
    <CustomLoadingAnimation isLoading={loading} />
  ) : (
    <div className="question-page">
      <QuestionInstructions question={question} showInstructions={false} />
      <div className="mt-3">
        <h5 className="text-decoration-underline mb-2">Test Cases</h5>
        {testCases && testCases.length > 0 ? (
          testCases.map((ele, index) => {
            return (
              <div
                className={`d-flex align-items-center mt-2 border p-2`}
                key={index}
              >
                <div className="status-text">
                  <div>
                    <u>Test Case {index + 1}</u>
                  </div>
                  {!ele.hidden && (
                    <>
                      <div>
                        Input: <br />
                        {Array.isArray(ele.input)
                          ? ele.input.map((item, itemIndex) => {
                              return (
                                <span key={itemIndex}>
                                  <b>{question?.inputType?.[itemIndex]?.paramName || `arg${itemIndex + 1}`}:</b>{' '}
                                  {formatTestCaseValue(item, question?.inputType?.[itemIndex]?.type)}
                                  <br />
                                </span>
                              );
                            })
                          : ele.input}
                      </div>
                      <div>
                        Expected Output:
                        <br /> {formatTestCaseValue(ele.output, question?.outputType)}
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div>No test cases found for this question.</div>
        )}
      </div>
    </div>
  );
};

export default Question;
