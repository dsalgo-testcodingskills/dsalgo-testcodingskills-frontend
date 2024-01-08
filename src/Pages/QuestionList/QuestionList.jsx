import React, { useEffect, useState } from 'react';
import { Modal } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { endTest, getTestAPI } from '../../Services/api';
import CustomLoadingAnimation from '../../components/CustomLoadingAnimation';
import './QuestionList.scss';
import CustomToast from '../../components/CustomToast/CustomToast';
import { setExpiry } from '../../Redux/Actions/dataAction';
import { CountDownTimer } from '../../components/CountDownTimer/CountDownTimer';

const QuestionList = () => {
  const history = useHistory();
  const params = useParams();
  const [tests, setTests] = useState();
  const [Loading, SetLoading] = useState(false);
  const { testExpiryTime } = useSelector((store) => store.dataReducer);
  const dispatch = useDispatch();
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const getTest = async (id) => {
    try {
      SetLoading(true);
      const resp = await getTestAPI(id);
      setTests(resp.data.test);

      return resp.data.test.testExpiry;
    } catch (error) {
      toast(<CustomToast type="error" message={error.message} />);
    } finally {
      SetLoading(false);
    }
  };

  const start = (q, sq) => {
    if (sq) {
      history.push(`/student/answer/${q.question._id}?samplequestion=true`);
    } else {
      history.push(`/student/answer/${q.question._id}`);
    }
  };

  const finalSubmit = async () => {
    try {
      SetLoading(true);
      const resp = await endTest(params.testId);

      toast(
        <CustomToast
          type="success"
          message={'Your Answers is submitted successfully'}
        />,
      );
      document.webkitExitFullscreen();
      history.push(`/student/test/${params.testId}`);

      return resp;
    } catch (error) {
      toast(<CustomToast type="error" message={error} />);

      return error;
    } finally {
      SetLoading(false);
    }
  };

  const setQuestionsList = async () => {
    const testExpiryTime = await getTest(params.testId);
    dispatch(setExpiry(testExpiryTime));
  };

  useEffect(() => {
    if (params.testId) {
      setQuestionsList();
    }
  }, [params.testId]);

  const onComplete = () => {
    finalSubmit();
    setShow(false);
  };

  return (
    <>
      <div className=" questionList disable-copy">
        <div className=" question-list-card">
          <h4>
            Instructions
            <span className=" questionList__timer float-end h6 mb-0">
              Timer:{' '}
              <CountDownTimer
                expiryTime={testExpiryTime}
                onComplete={onComplete}
              />
            </span>
          </h4>
          <ul className="questionList__instruction fs-6">
            <li>Solve as many questions as possible.</li>
            <li>You may refresh the page if needed.</li>
            <li>
              Please select your language before starting to code, as it will
              reset any existing code.
            </li>
            <li>
              To check your solutions click on{' '}
              <strong>{'"Run Test Cases"'}</strong>.
            </li>
            <li>
              Once you click on <strong>{'"Submit"'}</strong> that question will
              be disabled for editing.
            </li>
            <li>
              You can <strong>{'"Submit"'}</strong> the question even if test
              cases are failed.
            </li>
          </ul>
        </div>

        <div className=" question-list-card">
          <h4>Please select a question to start</h4>
        </div>
        <div className="card question-list-card py-3">
          <div className=" question-list">
            {tests?.questions?.map((q, i) => {
              return (
                <>
                  <div key={q.id} className="d-flex question">
                    <div className="question-status">
                      <span
                        className={` question-status-${
                          q.status === 'pending' ? 'pending' : 'attempted'
                        }`}
                      >
                        {q.status}
                      </span>
                    </div>
                    <label
                      className="form-check-label question-text px-2"
                      htmlFor={`question${i}`}
                      dangerouslySetInnerHTML={{ __html: q.question.question }}
                    ></label>
                    <div className="question-btn-holder me-3">
                      <button
                        className="btns btns--white"
                        onClick={() => {
                          let sq = false;
                          start(q, sq);
                        }}
                        disabled={
                          q.status === 'completed' ||
                          tests?.status === 'completed' ||
                          tests?.isExpired
                        }
                      >
                        Start
                      </button>
                    </div>
                  </div>
                  {i !== tests?.questions.length - 1 && <hr />}
                </>
              );
            })}
          </div>
        </div>
        <div className="d-flex justify-content-center">
          <button
            onClick={() => handleShow()}
            className="btns mt-5 "
            disabled={tests?.isExpired || tests?.status === 'completed'}
          >
            Submit Test
          </button>
        </div>
      </div>
      <CustomLoadingAnimation isLoading={Loading} />

      <Modal
        size="lg"
        show={show}
        onHide={handleClose}
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <h4 style={{ fontSize: '21px' }}></h4>Submit Test
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p style={{ fontSize: '17px', color: '#808593;' }}>
            Are you sure you want to submit this Test
          </p>
        </Modal.Body>
        <Modal.Footer>
          <button className="btns btns--white" onClick={handleClose}>
            Cancel
          </button>
          <button
            className="btns"
            style={{ marginLeft: '20px' }}
            onClick={() => {
              finalSubmit();
              setShow(false);
            }}
          >
            Submit
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default QuestionList;
