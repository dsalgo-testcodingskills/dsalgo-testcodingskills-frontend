import React, { useEffect, useState, useRef } from 'react';
import { Modal } from 'react-bootstrap';
import { useHistory, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import CustomLoadingAnimation from '../../components/CustomLoadingAnimation';
import CustomToast from '../../components/CustomToast/CustomToast';
import { getTestAPI, ShortlistStudent } from '../../Services/api';
import '../QuestionList/QuestionList.scss';
import './TestReview.scss';

const TestReview = () => {
  const history = useHistory();
  const params = useParams();
  const { testId } = params;
  const [tests, setTests] = useState();
  const [Loading, SetLoading] = useState(false);
  const [OpenModal, SetOpenModal] = useState(false);
  const [Status, SetStatus] = useState('review pending');
  const [Message, SetMessage] = useState('');
  const statusRef = useRef(null);

  const onCloseModal = () => {
    SetOpenModal(false);
  };

  const getTest = async (id) => {
    try {
      SetLoading(true);
      const resp = await getTestAPI(id, { admin: true });
      setTests(resp.data);

      if (resp?.data?.test?.moderation?.message) {
        SetMessage(resp?.data?.test?.moderation?.message);
      }
      if (resp?.data?.test?.moderation?.status) {
        SetStatus(resp?.data?.test?.moderation?.status);
      }
    } catch (error) {
      toast(<CustomToast type="error" message={error.message} />);
    } finally {
      SetLoading(false);
    }
  };

  const Shortlist = async () => {
    try {
      SetLoading(true);
      const request = {
        testId,
        moderation: { status: statusRef.current, message: Message },
      };
      await ShortlistStudent(request);

      if (statusRef.current === 'shortlisted') {
        toast(<CustomToast type="success" message={'Student Shortlisted'} />);
      } else {
        toast(<CustomToast type="success" message={'Student Rejected'} />);
      }

      SetStatus(statusRef.current);
    } catch (error) {
      toast(<CustomToast type="error" message={error} />);
    } finally {
      SetLoading(false);
    }
  };

  const start = (q) => {
    if (q) {
      history.push(`/admin/solutionsreview/${params.testId}/${q.question._id}`);
    }
  };

  useEffect(() => {
    if (testId) {
      getTest(testId);
    }
  }, []);

  return (
    <>
      <label className="head">
        <span
          onClick={() => history.push('/admin/testStatus')}
          style={{ cursor: 'pointer' }}
        >
          Dashboard
        </span>
        &nbsp; / Test Review
      </label>

      <div className="testReview my-4">
        <div>
          <div className="d-flex mb-4">
            <button
              className="btn btn-secondary rounded-pill px-4"
              onClick={() => history.goBack()}
            >
              <i className="fas fa-arrow-left"></i>&nbsp;&nbsp;Go Back
            </button>
          </div>

          <div
            className="d-flex py-3 justify-content-between align-items-center mb-4"
          >
            <h4
              className=" my-auto"
              style={{ fontSize: '21px', fontWeight: 700 }}
            >
              {tests?.test?.emailId
                ? tests?.test.emailId
                : tests?.test?.phone
                ? tests?.test?.phone
                : 'No Data Available'}{' '}
            </h4>
            <span
              className={` question-status-${
                Status !== 'review pending'
                  ? Status === 'shortlisted'
                    ? 'attempted'
                    : 'reject'
                  : 'pending'
              }`}
            >
              {Status}
            </span>
          </div>
        </div>
        <h5 className="heading">Please select a question to start</h5>
        <div className="card w-100 mt-3">
          <div className=" question-list py-2">
            {tests?.test?.questions?.map((q, i) => {
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
                          start(q);
                        }}
                      >
                        Review
                      </button>
                    </div>
                  </div>
                  {i !== tests?.test?.questions.length - 1 && <hr />}
                </>
              );
            })}
          </div>
        </div>

        <div className="d-flex justify-content-center mt-4">
          <button
            title="Shortlist"
            className="btns btns--success mx-3"
            onClick={() => {
              statusRef.current = 'shortlisted';
              SetOpenModal(true);
            }}
          >
            <i className="fas fa-check"></i>&nbsp;&nbsp;Approve
          </button>

          <button
            title="Reject"
            className="btns btns--danger"
            onClick={() => {
              statusRef.current = 'rejected';
              SetOpenModal(true);
            }}
          >
            <i className="fas fa-times"></i>&nbsp;&nbsp;Reject
          </button>
        </div>
        {/* )} */}
      </div>
      <CustomLoadingAnimation isLoading={Loading} />

      <Modal
        size="lg"
        show={OpenModal}
        onHide={onCloseModal}
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {' '}
            {statusRef.current === 'shortlisted' ? 'Approved' : 'Rejected'} &
            Add Notes
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="form-group my-3 d-flex flex-column justify-content-center">
            <label style={{ fontSize: '14px', color: '#979798' }}>
              Add Notes
            </label>
            <textarea
              className="form-control"
              id="exampleFormControlTextarea1"
              value={Message}
              onChange={(e) => {
                SetMessage(e.target.value);
              }}
              rows="3"
            ></textarea>
          </div>
        </Modal.Body>
        <Modal.Footer className="d-flex justify-content-end">
          <button
            className="btns btns--white"
            onClick={() => {
              SetOpenModal(false);
            }}
          >
            Close
          </button>
          <button
            className="btns"
            onClick={() => {
              Shortlist();
              onCloseModal();
            }}
          >
            Submit
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default TestReview;
