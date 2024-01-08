import { useParams } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import './CreateTest.scss';
import '../AssessmentPage/AssessmentPage.scss';
import { GetAllQuestions } from '../../Services/api';
import { toast } from 'react-toastify';
import CustomToast from '../../components/CustomToast/CustomToast';
import CustomLoadingAnimation from '../../components/CustomLoadingAnimation';
import QuestionInstructions from '../../components/QuestionInstructions/QuestionInstructions';

const Question = () => {
  const { questionId } = useParams();
  const [testCases, setTestCases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState();

  const initTest = async () => {
    try {
      setLoading(true);
      const result = await GetAllQuestions({ questionId });

      const testLocal = result.data.data[0];

      const questionLocalStorage = testLocal;
      setQuestion(questionLocalStorage);

      setTestCases(questionLocalStorage?.testCases);
    } catch (error) {
      toast(<CustomToast type="error" message={error.message} />);
    } finally {
      setLoading(false);
    }
  };

  const getTests = async () => {
    await initTest();
  };

  useEffect(() => {
    getTests();
  }, []);

  return loading ? (
    <CustomLoadingAnimation isLoading={loading} />
  ) : (
    <div className="question-page">
      <QuestionInstructions question={question} showInstructions={false} />
      <div className="mt-3">
        <h5 className="text-decoration-underline mb-2">Test Cases</h5>
        {testCases.map((ele, index) => {
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
                    <div>Input: <br/>
                          {ele.input.map((item,itemIndex)=>{
                            return (
                            <span key={itemIndex}>
                             {item.toString().split(',').join(' ')}<br/>
                            </span>)
                          })}
                          </div>
                            <div>Expected Output:<br/> {ele.output.toString().split(',').join(' ')}</div>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Question;
