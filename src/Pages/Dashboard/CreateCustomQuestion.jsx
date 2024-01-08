import { ErrorMessage, Field, FieldArray, Form, Formik } from 'formik';
import React, { useEffect, useState } from 'react';
import ReactQuill from 'react-quill';

import { toast } from 'react-toastify';
import CustomToast from '../../components/CustomToast/CustomToast';
import {
  submitCustomQuestion,
  getCustomQuestionById,
  editCustomQuestions,
} from '../../Services/api';
import { useParams, useHistory } from 'react-router-dom';
import './CreateTest.scss';
import Select from 'react-select';
import { Checkbox } from '@material-ui/core';
import * as Yup from 'yup';
import { CloseButton, Modal } from 'react-bootstrap';
import './CreateCustomQuestion.scss';
import CustomLoadingAnimation from '../../components/CustomLoadingAnimation';
import Plans from '../MyPlans/Plans';

const CreateCustomQuestion = () => {
  const inputOutputType = [
    '2d_array_int',
    '2d_array_char',
    'array_int',
    'array_char',
    'int',
    'boolean',
  ];

  const questionsLevelOptions = [
    { label: 'easy', value: 'easy' },
    { label: 'medium', value: 'medium' },
    { label: 'hard', value: 'hard' },
  ];

  const defaultDetails = {
    level: '',
    question: '',
    instructions: '',
    sampleQuestion: false,
    public: false,
    testCases: [
      {
        input: [],
        output: '',
        hidden: false,
      },
    ],
    inputType: [
      {
        type: '',
        paramName: '',
      },
    ],
    outputType: '',
  };

  const params = useParams();
  const history = useHistory();

  const [questionTypeOptions, setQuestionTypeOptions] = useState([]);
  const [Loading, SetLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [paymentPlan, setPaymentPlan] = useState(false);
  const [customCourseDetail, setCustomCourseDetail] = useState(defaultDetails);

  const CustomQuestionSchema = Yup.object().shape({
    level: Yup.string().required('Level Required'),
    question: Yup.string().required('Question Title Required'),
    instructions: Yup.string().required('Question Description Required'),
    inputType: Yup.array()
      .of(
        Yup.object().shape({
          type: Yup.string().required('Input Type is required'),
          paramName: Yup.string().required('Input Name is required'),
        }),
      )
      .required('InputType Required'),
    outputType: Yup.string().required('OutputType Required'),
    testCases: Yup.array()
      .of(
        Yup.object().shape({
          input: Yup.array()
            .of(Yup.string().required('Input is required'))
            .required('Input is required'),
          output: Yup.string().required('Output is required'),
        }),
      )
      .required('TestCases Required'),
  });

  useEffect(() => {
    getCustomQuestion();
    if (params.id) {
      setEditMode(true);
    }
  }, []);

  const getCustomQuestion = async () => {
    const options = inputOutputType.map((element) => ({
      label: element,
      value: element,
    }));
    setQuestionTypeOptions(options);

    if (params.id) {
      const res = await getCustomQuestionById(params.id);
      if (res?.data?.data) {
        for (let i = 0; i < res.data.data.testCases.length; i++) {
          for (let j = 0; j < res.data.data.testCases[i].input.length; j++) {
            res.data.data.testCases[i].input[j] = JSON.stringify(
              res.data.data.testCases[i].input[j],
            );
          }
          res.data.data.testCases[i].output = JSON.stringify(
            res.data.data.testCases[i].output,
          );
        }

        setCustomCourseDetail({
          ...res?.data?.data,
        });
      }
    }
  };

  const submitCustomQuestionForm = async (values) => {
    try {
      SetLoading(true);

      // Transform the testCase Input
      const tempTestCase = JSON.parse(JSON.stringify(values.testCases));
      for (let i = 0; i < tempTestCase.length; i++) {
        for (let j = 0; j < tempTestCase[i].input.length; j++) {
          tempTestCase[i].input.splice(
            j,
            1,
            JSON.parse(tempTestCase[i].input[j]),
          );
        }
        tempTestCase[i].input = JSON.stringify(tempTestCase[i].input);
      }
      const req = {
        ...values,
        testCases: tempTestCase,
      };

      if (editMode) {
        const editCustomQuestons = await editCustomQuestions(params.id, req);
        if (editCustomQuestons && editCustomQuestons.data.code === 200) {
          toast(
            <CustomToast
              type="success"
              message={'Custom Question Updated Successfully'}
            />,
          );
          history.push('/admin/customQuestion');
        } else {
          toast(
            <CustomToast
              type="error"
              message={editCustomQuestons && editCustomQuestons.data.message}
            />,
          );
        }
      } else {
        const newCreatordetailResult = await submitCustomQuestion(req);
        if (newCreatordetailResult.data.statusCode === 402) {
          setPaymentPlan(true);
          return;
        }
        if (
          newCreatordetailResult &&
          newCreatordetailResult.data.statusCode === 200
        ) {
          toast(
            <CustomToast
              type="success"
              message={'Custom Question Created Successfully'}
            />,
          );
          history.push('/admin/customQuestion');
        } else {
          toast(
            <CustomToast
              type="error"
              message={
                newCreatordetailResult && newCreatordetailResult.data.message
              }
            />,
          );
        }
      }
    } catch (error) {
      console.log({ error });
      if (Array.isArray(error) && error?.length > 0) {
        error.forEach((element) => {
          toast(<CustomToast type="error" message={element} />);
        });
      } else {
        toast(<CustomToast type="error" message={error.message} />);
      }
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
        </span>
        <span
          onClick={() => history.push('/admin/customQuestion')}
          style={{ cursor: 'pointer' }}
        >
          &nbsp; / Custom Questions
        </span>
        &nbsp; / Create Custom Question
      </label>
      <div className=" createCustomQuestion py-3 mt-4">
        <div className="d-flex mb-4 mx-2">
          <button
            className="btn btn-secondary rounded-pill px-4"
            onClick={() => history.goBack()}
          >
            <i className="fas fa-arrow-left"></i>&nbsp;&nbsp;Go Back
          </button>
        </div>
        <div
          className="card-title mt-4 card-header-text"
          style={{ marginLeft: '20px' }}
        >
          {editMode ? 'Edit Custom Question' : 'Create Custom Question'}
        </div>
        <Formik
          enableReinitialize={true}
          initialValues={customCourseDetail}
          validationSchema={CustomQuestionSchema}
          onSubmit={(values, { resetForm }) => {
            submitCustomQuestionForm(values, resetForm);
          }}
        >
          {({ values, setFieldValue, handleSubmit }) => (
            <Form className="px-5 d-flex flex-column my-3 ">
              <div className="row mt-3">
                <div>
                  {' '}
                  <h5>Question Details</h5>
                </div>
                <div className="col-6">
                  <label className="form-label createCustomQuestion__form-label">
                    Question Title
                  </label>
                  <Field
                    name="question"
                    type="string"
                    className="form-control"
                  />
                  <ErrorMessage
                    name="question"
                    render={(msg) => <div className="text-danger">{msg}</div>}
                  />
                </div>
                <div className="col-6">
                  <label className="form-label createCustomQuestion__form-label">
                    Question Description
                  </label>
                  <Field
                    name="instructions"
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
                    name="instructions"
                    render={(msg) => <div className="text-danger">{msg}</div>}
                  />
                </div>
              </div>

              <div className="row mt-3"></div>

              {/* InputType */}
              <FieldArray name="inputType">
                {({ remove, push }) => (
                  <div className="align-items-center mt-4 mb-3">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        {' '}
                        <h5>Input Details</h5>
                      </div>
                    </div>
                    <div className="p-1 mt-1 border rounded-2 py-3">
                      {values.inputType.map((type, index) => (
                        <div
                          className="selectQuestions-row row p-2"
                          key={index}
                        >
                          <div className="createCustomQuestion__input ">
                            <label>{index + 1}.</label>

                            <div className="createCustomQuestion__type">
                              <label className="mb-1 createCustomQuestion__form-label">
                                Input Type
                              </label>
                              <Select
                                options={questionTypeOptions}
                                value={{
                                  label: values.inputType[index].type,
                                  value: values.inputType[index].type,
                                }}
                                onChange={(e) => {
                                  setFieldValue(
                                    `inputType[${index}].type`,
                                    e.value,
                                  );
                                }}
                              />
                              <ErrorMessage
                                name={`inputType[${index}].type`}
                                render={(msg) => (
                                  <div className="text-danger">{msg}</div>
                                )}
                              />
                            </div>
                            <div className="createCustomQuestion__name">
                              <label className="mb-1  createCustomQuestion__form-label">
                                Input Name
                              </label>
                              <Field
                                name={`inputType[${index}].paramName`}
                                type="string"
                                className="form-control"
                              />
                              <ErrorMessage
                                name={`inputType[${index}].paramName`}
                                render={(msg) => (
                                  <div className="text-danger">{msg}</div>
                                )}
                              />
                            </div>
                            <button
                              type="button"
                              disabled={values.inputType.length === 1}
                              className="btns btns--white createCustomQuestion__removeBtn"
                              onClick={() => {
                                remove(index);
                                //Delete the element from testcase inuput array
                                for (
                                  let i = 0;
                                  i < values.testCases.length;
                                  i++
                                ) {
                                  values.testCases[i].input.splice(index, 1);
                                }
                              }}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                      <div className="d-flex justify-content-end">
                        <button
                          className="btns createCustomQuestion__addBtn"
                          type="button"
                          onClick={() => {
                            push({
                              type: '',
                              paramName: '',
                            });
                          }}
                        >
                          <i className="fas fa-plus"></i> Add
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </FieldArray>

              {/* Output Type */}
              <div className="row mt-3">
                <div className="col-6">
                  <h5>Output Details</h5>
                  <label className="form-label createCustomQuestion__form-label">
                    Select Output type
                  </label>
                  <Select
                    options={questionTypeOptions}
                    value={{
                      label: values.outputType,
                      value: values.outputType,
                    }}
                    onChange={(e) => {
                      setFieldValue('outputType', e.value);
                    }}
                  />
                  <ErrorMessage
                    name="outputType"
                    render={(msg) => <div className="text-danger">{msg}</div>}
                  />
                </div>

                {/* level */}
                <div className="col-6">
                  <h5>Difficulties</h5>
                  <label className="form-label createCustomQuestion__form-label">
                    Level
                  </label>
                  <Select
                    options={questionsLevelOptions}
                    value={{ label: values.level, value: values.level }}
                    onChange={(e) => {
                      setFieldValue('level', e.value);
                    }}
                  />
                  <ErrorMessage
                    name="level"
                    render={(msg) => <div className="text-danger">{msg}</div>}
                  />
                </div>
              </div>

              {/* testCases */}
              <FieldArray name="testCases">
                {({ remove, push }) => (
                  <div className="align-items-center mt-4 mb-3">
                    <div className="d-flex justify-content-between align-items-center">
                      <h5>Test Cases</h5>{' '}
                    </div>

                    <span className="test-case-note">
                      Note: String or character must be in double quotes ex.
                      [&quot;h&quot;,&quot;i&quot;,&quot;i&quot;]
                    </span>

                    <div className="p-1 mt-1 border rounded-2 py-3">
                      {values.testCases.map((test, index) => (
                        <div
                          className="selectQuestions-row row p-2"
                          key={index}
                        >
                          <div className="d-flex align-items-center">
                            <label className="">{index + 1} . &nbsp;</label>
                            <div className="createCustomQuestion__testCases createCustomQuestion__border py-3">
                              <div className="createCustomQuestion__name">
                                {values.inputType.map((type, inputIndex) => (
                                  <div key={inputIndex}>
                                    <label className="createCustomQuestion__form-label">
                                      Input
                                    </label>
                                    <label className="col-5">
                                      &nbsp; <b>{type.paramName}</b> &nbsp;
                                      <span
                                        className="badge text-uppercase mb-1"
                                        style={{
                                          background: 'orange',
                                          fontSize: '12px',
                                        }}
                                      >
                                        {type.type}
                                      </span>
                                    </label>

                                    <Field
                                      name={`testCases[${index}].input[${inputIndex}]`}
                                      type="string"
                                      className="col-2 form-control"
                                      onChange={(e) => {
                                        setFieldValue(
                                          `testCases[${index}].input[${inputIndex}]`,
                                          e.target.value,
                                        );
                                      }}
                                    />
                                    <ErrorMessage
                                      name={`testCases[${index}].input`}
                                      render={(msg) => (
                                        <div className="text-danger">{msg}</div>
                                      )}
                                    />
                                  </div>
                                ))}
                              </div>

                              <div className="createCustomQuestion__name">
                                <label className="createCustomQuestion__form-label">
                                  Output
                                </label>
                                <Field
                                  name={`testCases[${index}].output`}
                                  type="string"
                                  className="form-control"
                                />
                                <ErrorMessage
                                  name={`testCases[${index}].output`}
                                  render={(msg) => (
                                    <div className="text-danger">{msg}</div>
                                  )}
                                />
                              </div>

                              <div className=" text-end">
                                <span className="me-2">
                                  <Checkbox
                                    onChange={(e) => {
                                      setFieldValue(
                                        `testCases[${index}].hidden`,
                                        e.target.checked,
                                      );
                                    }}
                                    checked={values.testCases[index].hidden}
                                  />
                                  <label className=""> Hidden</label>
                                </span>
                              </div>
                              <div>
                                <button
                                  type="button"
                                  disabled={values.testCases.length === 1}
                                  className="btns btns--white createCustomQuestion__removeBtn"
                                  onClick={() => {
                                    remove(index);
                                  }}
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      <div className="d-flex justify-content-end">
                        <button
                          className="btns createCustomQuestion__addBtn"
                          type="button"
                          onClick={() => {
                            push({
                              input: [],
                              output: '',
                              hidden: false,
                            });
                          }}
                        >
                          <i className="fas fa-plus"></i>Add
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </FieldArray>

              <div className="d-flex justify-content-evenly">
                <button
                  type="submit"
                  className="btns mt-3"
                  onClick={handleSubmit}
                >
                  {editMode ? 'Update' : 'Create'}
                </button>
              </div>
            </Form>
          )}
        </Formik>
        <CustomLoadingAnimation isLoading={Loading} />

        {/* subscription payment modal */}
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
      </div>
    </>
  );
};

export default CreateCustomQuestion;
