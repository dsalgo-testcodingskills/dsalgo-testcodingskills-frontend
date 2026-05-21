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
import './PreviewModal.scss';
import CustomLoadingAnimation from '../../components/CustomLoadingAnimation';
import Plans from '../MyPlans/Plans';
import QuestionPreview from './QuestionPreview';
const ALL_TAGS = [
  { name: 'arrays', cat: 'data structures', n: '18.4k' },
  { name: 'strings', cat: 'data structures', n: '14.2k' },
  { name: 'linked-list', cat: 'data structures', n: '9.3k' },
  { name: 'stack', cat: 'data structures', n: '7.8k' },
  { name: 'queue', cat: 'data structures', n: '5.4k' },
  { name: 'hash-map', cat: 'data structures', n: '11.2k' },
  { name: 'trees', cat: 'data structures', n: '12.8k' },
  { name: 'binary-tree', cat: 'data structures', n: '10.1k' },
  { name: 'graph', cat: 'data structures', n: '9.6k' },
  { name: 'dynamic-programming', cat: 'algorithms', n: '22.1k' },
  { name: 'recursion', cat: 'algorithms', n: '15.3k' },
  { name: 'sorting', cat: 'algorithms', n: '13.4k' },
  { name: 'binary-search', cat: 'algorithms', n: '11.9k' },
  { name: 'two-pointers', cat: 'algorithms', n: '8.7k' },
  { name: 'greedy', cat: 'algorithms', n: '9.1k' },
  { name: 'backtracking', cat: 'algorithms', n: '6.6k' },
  { name: 'memoization', cat: 'algorithms', n: '4.8k' },
  { name: 'time-complexity', cat: 'complexity', n: '8.2k' },
  { name: 'space-complexity', cat: 'complexity', n: '5.6k' },
  { name: 'javascript', cat: 'language', n: '31k' },
  { name: 'python', cat: 'language', n: '28.5k' },
  { name: 'java', cat: 'language', n: '22k' },
  { name: 'c++', cat: 'language', n: '19.8k' },
];

const SUGGESTED_TAGS = ['dynamic-programming', 'arrays', 'memoization', 'recursion', 'time-complexity'];

const CreateCustomQuestion = () => {
  const inputOutputType = [
    '2d_array_int',
    '2d_array_char',
    'array_int',
    'array_char',
    'int',
    'boolean',
    'string',
  ];

  const questionsLevelOptions = [
    { label: 'easy', value: 'easy' },
    { label: 'medium', value: 'medium' },
    { label: 'hard', value: 'hard' },
  ];

  // defaultDetails
  const defaultDetails = {
    level: '',
    question: '',
    instructions: '',
    sampleQuestion: false,
    public: false,
    topics: [],
    topicInput: '',
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
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewQuestionData, setPreviewQuestionData] = useState(null);
  const [customCourseDetail, setCustomCourseDetail] = useState(defaultDetails);
  const [filteredTags, setFilteredTags] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const handlePreview = (values) => {
    const tempTestCase = JSON.parse(JSON.stringify(values.testCases));
    for (let i = 0; i < tempTestCase.length; i++) {
      for (let j = 0; j < tempTestCase[i].input.length; j++) {
        try {
          if (typeof tempTestCase[i].input[j] === 'string' && tempTestCase[i].input[j].trim() !== '') {
            tempTestCase[i].input.splice(
              j,
              1,
              JSON.parse(tempTestCase[i].input[j]),
            );
          }
        } catch (e) {
          console.error("Error parsing test case input", e);
        }
      }
      tempTestCase[i].input = JSON.stringify(tempTestCase[i].input);
    }
    setPreviewQuestionData({ ...values, testCases: tempTestCase });
    setShowPreviewModal(true);
  };

  const CustomQuestionSchema = Yup.object().shape({
    level: Yup.string().required('Level Required'),
    question: Yup.string().required('Question Title Required'),
    instructions: Yup.string().required('Question Description Required'),
    topics: Yup.array().min(1, 'Topics Required').required('Topics Required'),
    inputType: Yup.array()
      .of(
        Yup.object().shape({
          type: Yup.string().required('Input Type is required'),
          paramName: Yup.string().required('Input Name is required'),
        }),
      )
      .required('InputType Required'),
    outputType: Yup.string().required('OutputType Required'),
    public: Yup.boolean(),
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
        const questionData = res.data.data;
        for (let i = 0; i < questionData.testCases.length; i++) {
          for (let j = 0; j < questionData.testCases[i].input.length; j++) {
            questionData.testCases[i].input[j] = JSON.stringify(
              questionData.testCases[i].input[j],
            );
          }
          questionData.testCases[i].output = JSON.stringify(
            questionData.testCases[i].output,
          );
        }

        if (questionData.topics && typeof questionData.topics === 'string') {
          questionData.topics = questionData.topics.split(',').filter(t => t.trim() !== '');
        } else if (!questionData.topics) {
          questionData.topics = [];
        }

        setCustomCourseDetail({
          ...questionData,
          topicInput: '',
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

      const { topicInput, ...otherValues } = values;
      const req = {
        ...otherValues,
        // topics: values.topics.join(','), // Assuming backend expects comma separated string
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
          {({ values, setFieldValue, handleSubmit }) => {
            const addTopic = () => {
              if (values.topics.length >= 5) return;
              if (values.topicInput.trim() !== '') {
                const newTopic = values.topicInput.trim();
                if (!values.topics.includes(newTopic)) {
                  setFieldValue('topics', [...values.topics, newTopic]);
                }
                setFieldValue('topicInput', '');
              }
            };

            const removeTopic = (index) => {
              const updated = values.topics.filter((_, i) => i !== index);
              setFieldValue('topics', updated);
            };
            return (
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

                <div className="row mt-3">
                  <div className="mb-1">
                    <h5>Tags / Topics</h5>
                    <label className="form-label createCustomQuestion__form-label">
                      Add up to 5 tags to describe what your question is about. Start typing to search.
                    </label>
                  </div>

                  <div className="topic-wrapper">
                    <div
                      className="topic-input-box"
                      onClick={() => document.getElementById('topicInputField').focus()}
                    >
                      {values.topics.map((topic, index) => (
                        <div key={index} className="topic-chip">
                          <span>{topic}</span>
                          <button type="button" className="topic-chip__remove" onClick={() => removeTopic(index)}>
                            ✕
                          </button>
                        </div>
                      ))}

                      <div className="topic-input-inner">
                        <Field
                          id="topicInputField"
                          name="topicInput"
                          type="text"
                          className="topic-input-field"
                          placeholder={values.topics.length === 0 ? 'e.g. arrays, dynamic-programming…' : ''}
                          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTopic(); setShowDropdown(false); } }}
                          onChange={(e) => {
                            setFieldValue('topicInput', e.target.value);
                            const query = e.target.value.trim().toLowerCase();
                            if (query) {
                              const matches = ALL_TAGS.filter((t) => t.name.startsWith(query) && !values.topics.includes(t.name)).slice(0, 6);
                              setFilteredTags(matches);
                              setShowDropdown(true);
                            } else {
                              setShowDropdown(false);
                            }
                          }}
                          onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
                        />
                        <button type="button" className="topic-tick-btn" onClick={() => { addTopic(); setShowDropdown(false); }} disabled={values.topicInput.trim() === '' || values.topics.length >= 5}>
                          ✓
                        </button>
                      </div>
                    </div>

                    {/* Dropdown */}
                    {showDropdown && filteredTags.length > 0 && (
                      <div className="topic-dropdown">
                        {filteredTags.map((tag, i) => (
                          <div
                            key={i}
                            className="topic-dropdown__item"
                            onMouseDown={() => {
                              if (!values.topics.includes(tag.name) && values.topics.length < 5) {
                                setFieldValue('topics', [...values.topics, tag.name]);
                                setFieldValue('topicInput', '');
                                setShowDropdown(false);
                              }
                            }}
                          >
                            <span>
                              <strong>{tag.name.slice(0, values.topicInput.length)}</strong>
                              {tag.name.slice(values.topicInput.length)}
                            </span>
                            <span style={{ display: 'flex', gap: '10px' }}>
                              <span className="topic-dropdown__cat">{tag.cat}</span>
                              <span className="topic-dropdown__count">{tag.n}q</span>
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Suggested tags */}
                    <div style={{ marginTop: '4px' }}>
                      <p className="topic-suggested-label">suggested for this question</p>
                      <div className="topic-suggested-chips">
                        {SUGGESTED_TAGS.map((tag) => (
                          <span
                            key={tag}
                            className={`topic-suggested-chip ${values.topics.includes(tag) ? 'topic-suggested-chip--used' : ''}`}
                            onClick={() => {
                              if (!values.topics.includes(tag) && values.topics.length < 5) {
                                setFieldValue('topics', [...values.topics, tag]);
                              }
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="topic-count">Tags added: <strong>{values.topics.length}</strong> / 5</div>

                    {values.topics.length >= 5 && (
                      <small className="text-danger">Maximum 5 topics allowed.</small>
                    )}

                    <ErrorMessage name="topics" render={(msg) => <div className="text-danger" style={{ fontSize: '12px', marginTop: '4px' }}>{msg}</div>} />
                  </div>
                </div>
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

                  {/* public */}
                  <div className="col-12 mt-3">
                    <span className="me-2">
                      <Checkbox
                        onChange={(e) => {
                          setFieldValue('public', e.target.checked);
                        }}
                        checked={values.public}
                      />
                      <label className="form-label createCustomQuestion__form-label" style={{ marginBottom: 0 }}>
                        Is Public Question
                      </label>
                    </span>
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

                <div className="d-flex justify-content-center gap-3">
                  <button
                    type="submit"
                    className="btns mt-3"
                    onClick={handleSubmit}
                  >
                    {editMode ? 'Update' : 'Create'}
                  </button>
                  <button
                    type="button"
                    className="btns mt-3"
                    onClick={() => {
                      history.push(`/admin/customQuestionnew/preview`, {
                        question: {
                          ...values,
                          topics: values.topics || [],
                        }
                      });
                    }}
                  >
                    Preview
                  </button>
                </div>
              </Form>
            )
          }
          }
        </Formik>
        <CustomLoadingAnimation isLoading={Loading} />
        <Modal
          show={showPreviewModal}
          onHide={() => setShowPreviewModal(false)}
          size="xl"
          centered
          className="preview-modal"
        >
          <Modal.Header closeButton>
            <Modal.Title>Question Preview</Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ backgroundColor: '#f4f7f9', padding: '0' }}>
            {previewQuestionData && (
              <QuestionPreview questionData={previewQuestionData} isModal={true} />
            )}
          </Modal.Body>
        </Modal>

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
