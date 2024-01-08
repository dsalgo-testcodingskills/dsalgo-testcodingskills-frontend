import { ErrorMessage, Field, FieldArray, Form, Formik } from 'formik';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import ReactQuill from 'react-quill';
import '../../../node_modules/react-quill/dist/quill.snow.css';
import { useHistory } from 'react-router-dom';
import Select from 'react-select';
import AsyncSelect from 'react-select/async';
import { toast } from 'react-toastify';
import * as Yup from 'yup';
import CustomLoadingAnimation from '../../components/CustomLoadingAnimation';
import CustomToast from '../../components/CustomToast/CustomToast';
import {
  createMultiTest,
  createTest,
  GetAllQuestions,
} from '../../Services/api';
import './CreateTest.scss';
import { Checkbox, Tooltip } from '@material-ui/core';
import { CloseButton, Modal } from 'react-bootstrap';
import Plans from '../MyPlans/Plans';

const CreateTest = () => {
  const [multi, setMulti] = useState(false);
  const [paymentPlan, setPaymentPlan] = useState(false);
  const history = useHistory();
  const questionsLevelOptions = [
    { label: 'easy', value: 'easy' },
    { label: 'medium', value: 'medium' },
    { label: 'hard', value: 'hard' },
  ];
  const [questions, setQuestions] = useState({
    easy: [],
    medium: [],
    hard: [],
  });

  const currentDate = moment(moment().valueOf()).format('YYYY-MM-DDTHH:mm');
  const nextDate = moment(moment().add(7, 'day').valueOf()).format(
    'YYYY-MM-DDTHH:mm',
  );
  const defaultDetails = {
    email: '',
    phone: '',
    studentName: '',
    questionSelection: 'random',
    selectedQuestions: [],
    easy: 1,
    medium: 1,
    hard: 1,
    TestDuration: 60,
    StartDate: `${currentDate}`,
    EndDate: `${nextDate}`,
    type: 'single',
    title: '',
    description: '',
    webcamStatus: true,
    sendMail: false,
  };

  const filterOptions = async (inputValue, level) => {
    const options = questions[level].filter((question) =>
      question.label.toLowerCase().includes(inputValue.toLowerCase()),
    );
    return options;
  };

  useEffect(() => {
    getQuestions('easy');
    getQuestions('medium');
    getQuestions('hard');
  }, []);

  const getQuestions = async (level) => {
    try {
      const questions = await GetAllQuestions({
        sampleQuestion: false,
        level,
      });
      const mappedQuestions = questions.data.data.map((questionsData) => {
        return {
          value: questionsData._id,
          label: questionsData.question,
          level: questionsData.level,
        };
      });
      setQuestions((prevState) => {
        return { ...prevState, [level]: mappedQuestions };
      });
    } catch (error) {
      toast(<CustomToast type="error" message={error} />);
    }
  };

  const promiseOptions = (inputValue, level) => {
    return filterOptions(inputValue, level);
  };
  const [Loading, SetLoading] = useState(false);

  const schema = Yup.object().shape({
    studentName: Yup.string().required('Student Name is required'),
    email: Yup.string().when(['phone'], {
      is: (phone) => {
        return !phone;
      },
      then: Yup.string()
        .email('Invalid email address')
        .required('Email is required'),
    }),
    phone: Yup.string()
      .optional()
      .min(10, 'Phone number should contain 10 digits')
      .max(12, 'Phone number length should not be greater than 12'),
    selectedQuestions: Yup.array().of(
      Yup.object().shape({
        _id: Yup.string().nullable().required('Please select a question!'),
      }),
    ),
    easy: Yup.number()
      .integer()
      .min(0, 'Minimum Value should be Zero')
      .required(),
    medium: Yup.number()
      .integer()
      .min(0, 'Minimum Value should be Zero')
      .required(),
    hard: Yup.number()
      .integer()
      .min(0, 'Minimum Value should be Zero')
      .when(['easy', 'medium'], {
        is: (easy, medium) => easy === 0 && medium === 0,
        then: Yup.number().min(1, 'Please fill any of the field'),
      }),
    TestDuration: Yup.number().required().positive().integer().max(180).min(5),
    StartDate: Yup.date().default(function () {
      return new Date();
    }),
    EndDate: Yup.date().required('Please enter the end date'),
  });

  const multiUserSchemas = Yup.object().shape({
    title: Yup.string().required('Title is Required'),
    description: Yup.string().required('Description is Required'),
    selectedQuestions: Yup.array().of(
      Yup.object().shape({
        _id: Yup.string().nullable(),
      }),
    ),
    easy: Yup.number()
      .integer()
      .min(0, 'Minimum Value should be Zero')
      .required(),
    medium: Yup.number()
      .integer()
      .min(0, 'Minimum Value should be Zero')
      .required(),
    hard: Yup.number()
      .integer()
      .min(0, 'Minimum Value should be Zero')
      .when(['easy', 'medium'], {
        is: (easy, medium) => easy === 0 && medium === 0,
        then: Yup.number().min(1, 'Please fill any of the field'),
      }),
    TestDuration: Yup.number().required().positive().integer().max(180).min(5),
    StartDate: Yup.date().default(function () {
      return new Date();
    }),
    EndDate: Yup.date().required('Please enter the end date'),
  });

  const createtest = async (values) => {
    try {
      SetLoading(true);
      const request = {
        emailId: values.email,
        phone: values.phone,
        studentName: values.studentName,
        questionsTypes: {
          easy: values.easy,
          medium: values.medium,
          hard: values.hard,
        },
        selectedQuestions:
          values.questionSelection === 'random' ? [] : values.selectedQuestions,
        testDuration: values.TestDuration,
        startDate: new Date(values.StartDate).getTime(),
        endDate: new Date(values.EndDate).getTime(),
        webcamStatus: values.webcamStatus,
        sendMail: values.sendMail,
      };
      const resp = await createTest(request);

      if (resp.data.statusCode == 200) {
        console.log('Your plan is expire...');
        setPaymentPlan(true);
        toast(<CustomToast type="warning" message={'Test limit execeeded'} />);
      } else {
        navigator.clipboard.writeText(resp?.data?.link);
        if (request.emailId) {
          toast(
            <CustomToast
              type="success"
              message={'Test link sent successfully'}
            />,
          );
        } else if (request.phone) {
          toast(
            <CustomToast
              type="success"
              message={'Test link copied to your clipboard'}
            />,
          );
        }
        history.goBack();
      }
    } catch (error) {
      toast(<CustomToast type="error" message={error.message} />);
    } finally {
      SetLoading(false);
    }
  };

  const createmultitest = async (values) => {
    try {
      SetLoading(true);
      console.log(values);
      const request = {
        Title: values.title,
        Description: values.description,
        questionsTypes: {
          easy: values.easy,
          medium: values.medium,
          hard: values.hard,
        },

        selectedQuestions:
          values.questionSelection === 'random' ? [] : values.selectedQuestions,
        testDuration: values.TestDuration,
        startDate: new Date(values.StartDate).getTime(),
        endDate: new Date(values.EndDate).getTime(),
        webcamStatus: values.webcamStatus,
      };
      console.log('request => ', request);
      const resp = await createMultiTest(request);
      console.log('response ->', resp);
      if (resp.data.statusCode == 200) {
        console.log('Your plan is expire...');
        setPaymentPlan(true);
        toast(<CustomToast type="warning" message={'Test limit execeeded'} />);
        return;
      }
      navigator.clipboard.writeText(resp?.data?.link);
      if (request.emailId) {
        toast(
          <CustomToast
            type="success"
            message={'Test link sent successfully'}
          />,
        );
      } else if (request.phone) {
        toast(
          <CustomToast
            type="success"
            message={'Test link copied to your clipboard'}
          />,
        );
      } else if (multi) {
        toast(
          <CustomToast type="success" message={'Multi Test Link Created'} />,
        );
      }
      history.goBack();
    } catch (error) {
      toast(<CustomToast type="error" message={error.message} />);
    } finally {
      SetLoading(false);
    }
  };

  // React Rich Text Editor
  const modules = {
    toolbar: [
      [
        { header: '1' },
        { header: '2' },
        { header: [3, 4, 5, 6] },
        { font: [] },
      ],
      [{ size: [] }],
      ['bold', 'italic', 'underline', 'strike', 'bockquote'],
      [{ list: 'ordered' }, { list: 'bullet' }],

      ['clean'],
      ['code-block'],
    ],
  };

  const formats = [
    'header',
    'font',
    'size',
    'bold',
    'italic',
    'underline',
    'strike',
    'blockquote',
    'list',
    'bullet',

    'code-block',
  ];

  return (
    <>
      <label className="head">
        <span
          onClick={() => history.push('/admin/testStatus')}
          style={{ cursor: 'pointer' }}
        >
          Dashboard
        </span>{' '}
        &nbsp; / Create Test
      </label>
      <div className=" createTest">
        <Formik
          enableReinitialize={true}
          initialValues={defaultDetails}
          validationSchema={multi ? multiUserSchemas : schema}
          onSubmit={(values, { resetForm }) => {
            if (values.type === 'multi') {
              createmultitest(values);
            } else {
              createtest(values);
            }
            resetForm();
          }}
        >
          {({ values, setFieldValue }) => (
            <Form className=" d-flex flex-column my-3">
              <h4 className="">Create Test</h4>
              <div className=" row mb-4 ">
                <div className="col-6 radio-item">
                  <Field
                    name="type"
                    type="radio"
                    value="single"
                    id="single"
                    onClick={() => {
                      setMulti(false);
                    }}
                  />
                  <label htmlFor="single" style={{ cursor: 'pointer' }}>
                    &nbsp; Single Test{' '}
                  </label>
                  <Tooltip
                    title="Single test link can be created only for one participant. One link is valid for one time only."
                    arrow
                  >
                    <i
                      className="fa fa-sm fa-info-circle ms-2 border rounded-circle"
                      style={{ color: '#24C6DA' }}
                    ></i>
                  </Tooltip>
                </div>
                <div className="col-6 radio-item radio-item-2">
                  <Field name="type" type="radio" value="multi" id="multi" />
                  <label
                    htmlFor="multi"
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                      setMulti(true);
                    }}
                  >
                    &nbsp; Bulk Test
                  </label>
                  <Tooltip
                    title="Bulk test link can be created for multiple participants. A single participant can give the test multiple times on same link."
                    arrow
                  >
                    <i
                      className="fa fa-sm fa-info-circle ms-2 border rounded-circle"
                      style={{ color: '#24C6DA' }}
                    ></i>
                  </Tooltip>
                </div>
              </div>
              {values.type === 'single' && (
                <>
                  <div className="mauto">
                    <div>
                      {' '}
                      <h5>Student Details</h5>
                    </div>

                    <h6>
                      Note: Either Email or phone number is required to create
                      Test
                    </h6>
                  </div>
                  <div className="row mt-1 mb-4">
                    <div className="col-4">
                      <label className="form-label createTest__form-label">
                        Name
                      </label>
                      <Field
                        name="studentName"
                        type="text"
                        className="form-control"
                      />
                      <ErrorMessage
                        name="studentName"
                        render={(msg) => (
                          <div className="text-danger">{msg}</div>
                        )}
                      />
                    </div>

                    <div className="col-4">
                      <label className="form-label createTest__form-label">
                        Email address
                      </label>
                      <Field
                        name="email"
                        type="email"
                        className="form-control"
                      />
                      <ErrorMessage
                        name="email"
                        render={(msg) => (
                          <div className="text-danger">{msg}</div>
                        )}
                      />
                    </div>

                    <div className="col-4">
                      <label className="form-label createTest__form-label">
                        Phone number
                      </label>
                      <Field name="phone" type="tel" className="form-control" />
                      <ErrorMessage
                        name="phone"
                        render={(msg) => (
                          <div className="text-danger">{msg}</div>
                        )}
                      />
                    </div>
                  </div>
                  {values.email && (
                    <div className="row">
                      <span className="me-2">
                        <Checkbox
                          disabled={!values.email}
                          onChange={(e) => {
                            setFieldValue(`sendMail`, e.target.checked);
                          }}
                          checked={values.sendMail}
                        />
                        <label className="text-bold">
                          <h6>Send E-mail invite to user.</h6>
                        </label>
                      </span>
                    </div>
                  )}
                </>
              )}
              {values.type === 'multi' && (
                <>
                  <h5>Link Details</h5>
                  <div className="row mb-4">
                    <div className="col-6">
                      <label className="form-label">Title</label>
                      <Field
                        name="title"
                        type="text"
                        className="form-control"
                      />
                      <ErrorMessage
                        name="title"
                        render={(msg) => (
                          <div className="text-danger">{msg}</div>
                        )}
                      />
                    </div>

                    <div className="col-6">
                      <label className="form-label">Description</label>
                      <Field
                        name="description"
                        type="text"
                        className="form-control"
                      >
                        {({ field }) => (
                          <ReactQuill
                            placeholder="Write Something..."
                            modules={modules}
                            formats={formats}
                            onChange={field.onChange(field.name)}
                            value={field.value}
                          />
                        )}
                      </Field>
                      <ErrorMessage
                        name="description"
                        render={(msg) => (
                          <div className="text-danger">{msg}</div>
                        )}
                      />
                    </div>
                  </div>
                </>
              )}
              <h5>Test Difficulty</h5>
              <FieldArray name="selectedQuestions">
                {({ remove, push, replace }) => (
                  <div className="row align-items-center pb-2">
                    <div className="row">
                      <div className="col-3 radio-item">
                        <Field
                          name="questionSelection"
                          type="radio"
                          value="random"
                          id="random"
                        />
                        <label htmlFor="random" style={{ cursor: 'pointer' }}>
                          {' '}
                          &nbsp;Get random questions
                        </label>
                      </div>
                      <div className="col-4 radio-item">
                        <Field
                          name="questionSelection"
                          type="radio"
                          value="manual"
                          id="manual"
                          onFocus={() => {
                            console.log('running');
                            if (values.selectedQuestions.length === 0) {
                              push({
                                ...{
                                  label: questions['easy'][0]?.label,
                                  level: questions['easy'][0]?.level,
                                  _id: questions['easy'][0]?.value,
                                },
                              });
                            }
                          }}
                        />
                        <label
                          htmlFor="manual"
                          style={{ cursor: 'pointer' }}
                          onClick={() => {
                            console.log('running');
                            if (values.selectedQuestions.length === 0) {
                              push({
                                ...{
                                  label: 'Select Question',
                                  level: 'Select Level',
                                },
                              });
                            }
                          }}
                        >
                          {' '}
                          &nbsp;Select questions manually
                        </label>
                      </div>
                    </div>

                    {values.questionSelection === 'manual' && (
                      <div
                        className="border p-3 mt-3 rounded-3"
                        hidden={values.selectedQuestions.length === 0}
                      >
                        {values.selectedQuestions.map((question, index) => (
                          <div className="selectQuestions-row" key={index}>
                            <div className="index-margin">{index + 1}.</div>
                            <div className="selectLevel">
                              <Select
                                options={questionsLevelOptions}
                                value={
                                  question && {
                                    label: question?.level,
                                    value: question?.level,
                                  }
                                }
                                placeholder="slafkjadsflkj"
                                defaultValue={{
                                  label: 'Select',
                                  value: question?.level,
                                }}
                                onChange={(e) => {
                                  replace(index, {
                                    ...question,
                                    level: e.value,
                                  });
                                }}
                              />
                            </div>
                            <div className="selectQuestion">
                              <AsyncSelect
                                name={`selectedQuestions.${index}._id`}
                                value={question && question}
                                defaultValue={index === 0 && question}
                                getOptionLabel={(e) => (
                                  <div
                                    dangerouslySetInnerHTML={{
                                      __html: e.label,
                                    }}
                                  ></div>
                                )}
                                placeholder="Select Question"
                                defaultOptions={questions[question.level]}
                                loadOptions={(inputValue) =>
                                  promiseOptions(inputValue, question.level)
                                }
                                onChange={(e) => {
                                  replace(index, {
                                    level: e.level,
                                    label: e.label,
                                    _id: e.value,
                                  });
                                }}
                              />
                              <ErrorMessage
                                name={`selectedQuestions.${index}._id`}
                                render={(msg) => (
                                  <div className="text-danger">{msg}</div>
                                )}
                              />
                            </div>

                            <div className="" style={{ marginLeft: '1rem' }}>
                              <button
                                type="button"
                                disabled={question.label === null}
                                className="btns view-btn"
                                style={{ padding: '9px 25px' }}
                                onClick={() =>
                                  window.open(
                                    `/admin/question/${question._id}`,
                                    '_blank',
                                  )
                                }
                              >
                                View
                              </button>
                            </div>
                            <div className="removeQuestion-margin">
                              <button
                                type="button"
                                disabled={values.selectedQuestions.length === 1}
                                className="actionIcon"
                                onClick={() => {
                                  remove(index);
                                }}
                              >
                                <img src="/images/delete.svg" />
                              </button>
                            </div>
                          </div>
                        ))}
                        <div className="col-12 d-flex justify-content-end pe-3 mt-3">
                          <button
                            className="btns"
                            type="button"
                            style={{ padding: '14px 20px' }}
                            onClick={() => {
                              push({
                                label: null,
                                level: 'easy',
                                _id: null,
                              });
                            }}
                          >
                            <i className="fas fa-plus"></i> Add Question
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </FieldArray>

              {values.questionSelection === 'random' && (
                <div className="row my-2 mb-4">
                  <div className="col-4">
                    <label className="form-label createTest__form-label">
                      Easy
                    </label>
                    <Field
                      name="easy"
                      type="number"
                      min="0"
                      className="form-control"
                    />
                    <ErrorMessage
                      name="easy"
                      render={(msg) => <div className="text-danger">{msg}</div>}
                    />
                  </div>

                  <div className="col-4">
                    <label className="form-label createTest__form-label">
                      Medium
                    </label>
                    <Field
                      name="medium"
                      type="number"
                      min="0"
                      className="form-control"
                    />
                    <ErrorMessage
                      name="medium"
                      render={(msg) => <div className="text-danger">{msg}</div>}
                    />
                  </div>

                  <div className="col-4">
                    <label className="form-label createTest__form-label">
                      Hard
                    </label>
                    <Field
                      name="hard"
                      type="number"
                      min="0"
                      className="form-control"
                    />
                    <ErrorMessage
                      name="hard"
                      render={(msg) => <div className="text-danger">{msg}</div>}
                    />
                  </div>
                </div>
              )}
              <h5>Test Details</h5>
              <div className="row mb-4" style={{ alignItems: 'baseline' }}>
                <div
                  className={`${values.type === 'multi' && 'col-4'} col-4 mb-2`}
                >
                  <label className="form-label createTest__form-label">
                    Test Duration (Minutes)
                  </label>
                  <Field
                    name="TestDuration"
                    type="number"
                    className="form-control"
                  />
                  <ErrorMessage
                    name="TestDuration"
                    render={(msg) => <div className="text-danger">{msg}</div>}
                  />
                </div>
                <div className="my-2 col-4">
                  <label className="form-label createTest__form-label">
                    Start Date
                  </label>
                  <Field
                    name="StartDate"
                    type="datetime-local"
                    min={`${moment(moment().valueOf()).format(
                      'YYYY-MM-DD',
                    )}T00:00`}
                    className="form-control"
                  />
                  <ErrorMessage
                    name="StartDate"
                    render={(msg) => <div className="text-danger">{msg}</div>}
                  />
                </div>
                <div className="my-2 col-4">
                  <label className="form-label createTest__form-label">
                    End Date
                  </label>
                  <Field
                    name="EndDate"
                    type="datetime-local"
                    min={`${moment(moment().add(7, 'days').valueOf()).format(
                      'YYYY-MM-DD',
                    )}T00:00`}
                    className="form-control"
                  />
                  <ErrorMessage
                    name="EndDate"
                    render={(msg) => <div className="text-danger">{msg}</div>}
                  />
                </div>
              </div>

              <h5>Webcam</h5>
              <div className="row mb-4">
                <div className="col-3 radio-item">
                  <Field
                    name="webcamStatus"
                    type="radio"
                    value={true}
                    id="webcam"
                  />
                  <label
                    htmlFor="webcamStatus"
                    onClick={() => setFieldValue('webcamStatus', true)}
                    style={{ cursor: 'pointer' }}
                  >
                    {' '}
                    &nbsp;Enable
                  </label>
                </div>
                <div className="col-3 radio-item">
                  <Field
                    name="webcamStatus"
                    type="radio"
                    value={false}
                    id="webcam"
                  />
                  <label
                    htmlFor="webcamStatus"
                    onClick={() => setFieldValue('webcamStatus', false)}
                    style={{ cursor: 'pointer' }}
                  >
                    {' '}
                    &nbsp;Disable
                  </label>
                </div>
              </div>
              <div className="d-flex justify-content-end">
                <button
                  onClick={() => history.goBack()}
                  className="btns p-2 mt-3"
                >
                  Cancel
                </button>
                <button type="submit" className="btns p-2 mt-3 ms-2">
                  Create Test
                </button>
              </div>
            </Form>
          )}
        </Formik>
        <CustomLoadingAnimation isLoading={Loading} />
      </div>

      <Modal
        show={paymentPlan}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter example-modal-sizes-title-lg"
        centered
      >
        <Modal.Header>
          <Modal.Title
            id="contained-modal-title-vcenter"
            className="text-center"
          >
            <h4
              style={{
                fontWeight: '500',
                fontSize: '21px',
                lineHeight: '25px',
                textAlign: 'left',
              }}
            ></h4>{' '}
            Upgrade your plan
          </Modal.Title>
          <CloseButton
            onClick={() => {
              setPaymentPlan(false);
            }}
          />
        </Modal.Header>
        <Plans />
      </Modal>
    </>
  );
};

export default CreateTest;
