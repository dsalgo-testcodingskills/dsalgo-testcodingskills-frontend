import { ErrorMessage, Field, FieldArray, Form, Formik } from 'formik';
import { useEffect, useState } from 'react';

import { toast } from 'react-toastify';
import CustomToast from '../../components/CustomToast/CustomToast';
import {
  submitCustomQuestion,
  getCustomQuestionById,
  editCustomQuestions,
  saveDraftQuestion,
} from '../../Services/api';
import { useParams, useHistory } from 'react-router-dom';
import './CreateTest.scss';
import Select from 'react-select';
import { Checkbox, IconButton } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import * as Yup from 'yup';
import { CloseButton, Modal } from 'react-bootstrap';
import './CreateCustomQuestion.scss';
import './PreviewModal.scss';
import CustomLoadingAnimation from '../../components/CustomLoadingAnimation';
import Plans from '../MyPlans/Plans';
import QuestionPreview from './QuestionPreview';
import { ALL_TAGS } from '../../utils/constants';
import LivePreview from './LivePreview';
import OutputConstraintsSection from './OutputConstraintsSection';
import ParameterConstraints from './ParameterConstraints';


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

  const defaultDetails = {
    questionType: 'dsa',
    level: '',
    question: '',
    instructions: '',
    sampleQuestion: false,
    public: false,
    topics: [],
    topicInput: '',
    constraints: {
      timeLimit: 2000,
      memoryLimit: 256
    },
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
        constraints: {},
      },
    ],
    outputType: '',
    outputConstraints: {
      isOrdered: true,
      tolerance: 0,
      caseSensitive: true
    },
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
    constraints: Yup.object().shape({
      timeLimit: Yup.number().min(100).max(15000).required(),
      memoryLimit: Yup.number().min(1).max(1024).required()
    }),
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
        if (res.data.data.topics && typeof res.data.data.topics === 'string') {
          res.data.data.topics = res.data.data.topics.split(',').filter(t => t.trim() !== '');
        } else if (!res.data.data.topics) {
          res.data.data.topics = [];
        }
        
        // Handle time limit conversion if stored as seconds in backend
        const questionData = res.data.data;
        if (questionData.constraints && questionData.constraints.timeLimit < 100) {
           questionData.constraints.timeLimit = questionData.constraints.timeLimit * 1000;
        }

        setCustomCourseDetail({
          ...defaultDetails,
          ...questionData,
           topicInput: '',
        });
      }
    }
  };

 const submitCustomQuestionForm = async (values) => {
    try {
      SetLoading(true);
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
        testCases: tempTestCase,
      };
      if (editMode) {
        const editCustomQuestons = await editCustomQuestions(params.id, req);
        if (editCustomQuestons && editCustomQuestons.data.code === 200) {
          toast(
            <CustomToast
              type="success"
              message={
                "Custom Question Updated! Redirecting to verification..."
              }
            />,
          );
          history.push(`/admin/customQuestion/verify/${params.id}`);
        } else {
          toast(
            <CustomToast
              type="error"
              message={editCustomQuestons && editCustomQuestons.data.message}
            />,
          );
        }
      } else {
        // Save as draft and redirect to verify page
        const draftResult = await saveDraftQuestion(req);
        if (draftResult.data.statusCode === 402) {
          setPaymentPlan(true);
          return;
        }
        if (draftResult && draftResult.data.statusCode === 200) {
          toast(
            <CustomToast
              type="success"
              message={"Draft saved! Redirecting to verification..."}
            />,
          );
          const draftId = draftResult.data.data._id;
          history.push(`/admin/customQuestion/verify/${draftId}`);
        } else {
          toast(
            <CustomToast
              type="error"
              message={draftResult && draftResult.data.message}
            />,
          );
        }
      }
    } catch (error) {
      console.warn('submitCustomQuestionForm error', error);
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

  // in future
  // const QUESTION_CATEGORY_OPTIONS = [
  //   { label: 'DSA / Algorithm & General Programming', value: 'dsa' },
  //   { label: 'Database / SQL', value: 'database' },
  // ];

  return (
    <>
      <label className="head">
        <span onClick={() => history.push('/admin/testStatus')} style={{ cursor: 'pointer' }}>Dashboard</span>
        <span onClick={() => history.push('/admin/customQuestion')} style={{ cursor: 'pointer' }}>&nbsp; / Custom Questions</span>
        &nbsp; / Create Custom Question
      </label>
      <div className=" createCustomQuestion py-3 mt-4">
        <div className="d-flex mb-4 mx-2">
          <button className="btn btn-secondary rounded-pill px-4" onClick={() => history.goBack()}>
            <i className="fas fa-arrow-left"></i>&nbsp;&nbsp;Go Back
          </button>
        </div>
        <div className="card-title mt-4 card-header-text" style={{ marginLeft: '20px' }}>
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
          {({ values, setFieldValue, handleSubmit, dirty, validateForm, errors }) => {
            const findFirstErrorPath = (errObj) => {
              if (!errObj) return null;
              if (typeof errObj === 'string') return '';
              if (Array.isArray(errObj)) {
                for (let i = 0; i < errObj.length; i++) {
                  const res = findFirstErrorPath(errObj[i]);
                  if (res !== null) return `[${i}]${res.startsWith('.') ? res : (res ? '.' + res : '')}`;
                }
                return null;
              }
              for (const key of Object.keys(errObj)) {
                const val = errObj[key];
                if (typeof val === 'string') return key;
                const sub = findFirstErrorPath(val);
                if (sub !== null) return `${key}${sub.startsWith('[') ? sub : '.' + sub}`;
              }
              return null;
            };

            const scrollToFieldPath = (fieldPath) => {
              if (!fieldPath) return;
              const safe = String(fieldPath).replace(/"/g, '\\"');
              let el = document.querySelector(`[name="${safe}"]`);
              if (!el) {
                const alt = String(fieldPath).replace(/\.?(\d+)\./g, '[$1].');
                el = document.querySelector(`[name="${alt}"]`);
              }
              if (!el && (fieldPath === 'topics' || fieldPath === 'topicInput')) {
                el = document.getElementById('topicInputField');
              }
              if (!el) el = document.getElementById(safe);
              if (!el) el = document.querySelector('input,select,textarea');
              if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                try { el.focus(); } catch (e) { /* eslint-disable-next-line no-console */ console.warn('focus failed', e); }
              }
            };
            const addTopic = () => {
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
              <Form
                className="question-builder"
                onSubmitCapture={() => {
                  if (values.topicInput && values.topicInput.trim() !== '') {
                    const newTopic = values.topicInput.trim();
                    if (!values.topics.includes(newTopic) && values.topics.length < 5) {
                      setFieldValue('topics', [...values.topics, newTopic]);
                    }
                    setFieldValue('topicInput', '');
                  }

                  validateForm().then((errs) => {
                    if (errs && Object.keys(errs).length > 0) {
                      const first = findFirstErrorPath(errs);
                      let fieldPath = first;
                      if (fieldPath && fieldPath.startsWith('.')) fieldPath = fieldPath.slice(1);
                      if (fieldPath === 'topics') fieldPath = 'topicInput';
                      scrollToFieldPath(fieldPath);
                    }
                  });
                }}
              >
                <div className="question-builder__layout">
                  <div className="question-builder__main">
                    {/* <div className="builder-card builder-card--primary">
                      <div className="builder-card__header">
                        <h5>Question Category</h5>
                        <p className="builder-card__subtitle">Select the type of challenge you want to create.</p>
                      </div>
                      <div className="builder-card__body">
                        <div className="row">
                          <div className="col-12">
                            <div className="d-flex gap-3">
                              {QUESTION_CATEGORY_OPTIONS.map((opt) => (
                                <div
                                  key={opt.value}
                                  className={`category-selector ${values.questionType === opt.value ? 'category-selector--active' : ''}`}
                                  onClick={() => setFieldValue('questionType', opt.value)}
                                >
                                  <div className="category-selector__icon">
                                    <i className={opt.value === 'dsa' ? 'fas fa-code' : 'fas fa-database'}></i>
                                  </div>
                                  <div className="category-selector__text">
                                    <div className="category-selector__label">{opt.label}</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div> */}
                    <div className="builder-card">
                      <div className="builder-card__header">
                        <h5>Question Details</h5>
                        <p className="builder-card__subtitle">Basic information about the coding problem.</p>
                      </div>
                      <div className="builder-card__body">
                        <div className='row'>
                          <div className="col-md-6 mb-3">
                            <label className="createCustomQuestion__form-label">Question Title</label>
                            <Field name="question" type="string" className="form-control" placeholder="e.g. Subarray Sum Equals K" />
                            <ErrorMessage name="question" render={(msg) => <div className="text-danger small mt-1">{msg}</div>} />
                          </div>
                          <div className="col-md-6 mb-3">
                            <label className="createCustomQuestion__form-label">Level</label>
                            <Select
                              options={questionsLevelOptions}
                              placeholder="Select Difficulty"
                              value={questionsLevelOptions.find(opt => opt.value === values.level)}
                              onChange={(e) => setFieldValue('level', e.value)}
                            />
                            <ErrorMessage name="level" render={(msg) => <div className="text-danger small mt-1">{msg}</div>} />
                          </div>
                          <div className="col-12 mt-2">
                            <label className="createCustomQuestion__form-label">Question Description</label>
                            <Field name="instructions" as="textarea" className="form-control" rows="6" placeholder="Provide a clear description of the problem..." />
                            <ErrorMessage name="instructions" render={(msg) => <div className="text-danger small mt-1">{msg}</div>} />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="builder-card">
                        <div className="builder-card__header">
                            <h5>Execution Constraints</h5>
                            <p className="builder-card__subtitle">Limits for the code execution environment.</p>
                        </div>
                        <div className="builder-card__body">
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label className="createCustomQuestion__form-label">Time Limit (ms)</label>
                                    <Field name="constraints.timeLimit" type="number" className="form-control" placeholder="e.g. 2000" />
                                    <div className="text-muted small mt-1">Recommended: 1000ms - 15000ms</div>
                                    <ErrorMessage name="constraints.timeLimit" render={(msg) => <div className="text-danger small mt-1">{msg}</div>} />
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label className="createCustomQuestion__form-label">Memory Limit (MB)</label>
                                    <Field name="constraints.memoryLimit" type="number" className="form-control" placeholder="e.g. 256" />
                                    <div className="text-muted small mt-1">Recommended: 128MB - 512MB</div>
                                    <ErrorMessage name="constraints.memoryLimit" render={(msg) => <div className="text-danger small mt-1">{msg}</div>} />
                                </div>
                            </div>
                        </div>
                    </div>

                <div className="builder-card">
                  <div className="builder-card__header">
                    <h5>Tags / Topics</h5>
                    <p className="builder-card__subtitle">Add up to 5 tags to describe your question.</p>
                  </div>

                  <div className="builder-card__body">
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
                          placeholder={values.topics.length === 0 ? 'e.g. arrays, dynamic-programming...' : ''}
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
                        <IconButton
                          color="primary"
                          onClick={addTopic}
                          disabled={values.topicInput.trim() === ''}
                          size="small"
                        >
                          <AddIcon />
                        </IconButton>
                      </div>
                    </div>

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
                            <span><strong>{tag.name.slice(0, values.topicInput.length)}</strong>{tag.name.slice(values.topicInput.length)}</span>
                            <span style={{ display: 'flex', gap: '10px' }}>
                              <span className="topic-dropdown__cat">{tag.cat}</span>
                              <span className="topic-dropdown__count">{tag.n}q</span>
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                        <div className="mt-2 text-muted small">suggested: 
                          {SUGGESTED_TAGS.filter(t => !values.topics.includes(t)).map(tag => (
                            <span key={tag} className="ms-2 cursor-pointer text-primary" onClick={() => values.topics.length < 5 && setFieldValue('topics', [...values.topics, tag])}>{tag}</span>
                          ))}
                        </div>
                        <div className="topic-count mt-2">Tags: <strong>{values.topics.length}</strong> / 5</div>
                        <ErrorMessage name="topics" render={(msg) => <div className="text-danger small mt-1">{msg}</div>} />
                      </div>
                    </div>

                    <div className="builder-card">
                      <div className="builder-card__header">
                        <h5>Function Parameters</h5>
                        <p className="builder-card__subtitle">Define the input parameters for the solution.</p>
                      </div>
                      <div className="builder-card__body">
                        <FieldArray name="inputType">
                          {({ remove, push }) => (
                            <>
                              {values.inputType.map((type, index) => (
                                <div key={index} className="parameter-card mb-4 shadow-sm border p-3 rounded-3">
                                  <div className="parameter-card__header d-flex justify-content-between mb-3">
                                    <h6 className="mb-0">Parameter #{index + 1}</h6>
                                    {values.inputType.length > 1 && (
                                      <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => {
                                        const updatedCases = values.testCases.map((tc) => ({
                                          ...tc,
                                          input: tc.input.filter((_, idx) => idx !== index),
                                        }));
                                        setFieldValue('testCases', updatedCases);
                                        remove(index);
                                      }}>Remove</button>
                                    )}
                                  </div>
                                  <div className="row g-3">
                                    <div className="col-md-6">
                                      <label className="createCustomQuestion__form-label">Input Type</label>
                                      <Select
                                        options={questionTypeOptions}
                                        placeholder="Select Type"
                                        value={questionTypeOptions.find(opt => opt.value === values.inputType[index].type)}
                                        onChange={(e) => {
                                          setFieldValue(`inputType[${index}].type`, e.value);
                                          setFieldValue(`inputType[${index}].constraints`, {});
                                        }}
                                      />
                                      <ErrorMessage name={`inputType[${index}].type`} render={msg => <div className="text-danger small mt-1">{msg}</div>} />
                                    </div>
                                    <div className="col-md-6">
                                      <label className="createCustomQuestion__form-label">Parameter Name</label>
                                      <Field name={`inputType[${index}].paramName`} className="form-control" placeholder="e.g. nums" />
                                      <ErrorMessage name={`inputType[${index}].paramName`} render={msg => <div className="text-danger small mt-1">{msg}</div>} />
                                    </div>
                                  </div>
                                  <div className="border-top pt-3 mt-3">
                                    <h6 className="mb-3 small text-uppercase text-muted fw-bold">Constraints</h6>
                                    <ParameterConstraints param={type} index={index} setFieldValue={setFieldValue} />
                                  </div>
                                </div>
                              ))}
                              <div className="d-flex justify-content-end">
                                <button type="button" className="btns createCustomQuestion__addBtn" onClick={() => push({ type: '', paramName: '', constraints: {} })}>
                                  <i className="fas fa-plus me-2"></i>Add Parameter
                                </button>
                              </div>
                            </>
                          )}
                        </FieldArray>
                      </div>
                    </div>

                    <div className="builder-card">
                      <div className="builder-card__header">
                        <h5>Output Details</h5>
                      </div>
                      <div className="builder-card__body">
                        <div className="row">
                          <div className="col-md-6 text-start">
                            <label className="createCustomQuestion__form-label">Expected Output Type</label>
                            <Select
                              options={questionTypeOptions}
                              placeholder="Select Return Type"
                              value={questionTypeOptions.find(opt => opt.value === values.outputType)}
                              onChange={(e) => setFieldValue('outputType', e.value)}
                            />
                            <ErrorMessage name="outputType" render={msg => <div className="text-danger small mt-1">{msg}</div>} />
                          </div>
                        </div>
                        <OutputConstraintsSection values={values} setFieldValue={setFieldValue} />
                      </div>
                    </div>

                    <div className="builder-card">
                      <div className="builder-card__header">
                        <h5>Test Cases</h5>
                      </div>
                      <div className="builder-card__body">
                        <FieldArray name="testCases">
                          {({ remove, push }) => (
                            <div>
                               <div className="alert alert-info py-2 px-3 small mb-4">
                                <i className="fas fa-info-circle me-2"></i>
                                Strings must be in double quotes (e.g. &quot;abc&quot;). Arrays should be [1,2,3] or [&quot;a&quot;,&quot;b&quot;].
                              </div>
                              {values.testCases.map((test, index) => (
                                <div className="test-case-row mb-4 border rounded-3 p-0" key={index}>
                                  <div className="test-case-row__header bg-light p-3 border-bottom d-flex justify-content-between align-items-center">
                                    <span className="fw-bold">Test Case #{index + 1}</span>
                                    <div className="d-flex align-items-center gap-3">
                                      <div className="form-check mb-0 d-flex align-items-center">
                                        <Checkbox
                                          onChange={(e) => setFieldValue(`testCases[${index}].hidden`, e.target.checked)}
                                          checked={values.testCases[index].hidden}
                                          id={`hidden-${index}`}
                                        />
                                        <label className="ms-1 mb-0 small" htmlFor={`hidden-${index}`}>Hidden Case</label>
                                      </div>
                                      <button type="button" disabled={values.testCases.length === 1} className="btn btn-link text-danger p-0 text-decoration-none small" onClick={() => remove(index)}>Remove</button>
                                    </div>
                                  </div>
                                  <div className="test-case-row__body p-3">
                                    <div className="row g-3">
                                      {values.inputType.map((type, inputIndex) => (
                                        <div className="col-md-4 text-start" key={inputIndex}>
                                          <label className="createCustomQuestion__form-label small d-flex justify-content-between">
                                            <span>Input: <b>{type.paramName || 'input'}</b></span>
                                            <span className="text-muted text-uppercase" style={{fontSize: '9px'}}>{type.type}</span>
                                          </label>
                                          <Field name={`testCases[${index}].input[${inputIndex}]`} className="form-control form-control-sm" placeholder="Value" onChange={(e) => setFieldValue(`testCases[${index}].input[${inputIndex}]`, e.target.value)} />
                                        </div>
                                      ))}
                                      <div className="col-md-4 text-start">
                                        <label className="createCustomQuestion__form-label small">Expected Output</label>
                                        <Field name={`testCases[${index}].output`} className="form-control form-control-sm" placeholder="Output" />
                                      </div>
                                    </div>
                                    <ErrorMessage name={`testCases[${index}].input`} render={msg => <div className="text-danger small mt-1">{msg}</div>} />
                                  </div>
                                </div>
                              ))}
                              <div className="d-flex justify-content-end">
                                <button className="btns createCustomQuestion__addBtn" type="button" onClick={() => push({ input: [], output: '', hidden: false })}>
                                  <i className="fas fa-plus me-2"></i>Add Test Case
                                </button>
                              </div>
                            </div>
                          )}
                        </FieldArray>
                      </div>
                    </div>

                    <div className="d-flex justify-content-center gap-3">
                  {editMode && (
                    <button
                      type="submit"
                      className={`btns mt-3 ${
                        !dirty ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                      disabled={!dirty}
                    >
                      <i className="fas fa-save me-2"></i>
                      Update & Verify
                    </button>
                  )}
                  {!editMode && (
                    <button
                      type="submit"
                      className="btns mt-3"
                    >
                      <i className="fas fa-save me-2"></i>
                      Save & Verify
                    </button>
                  )}
                </div>
                  </div>

                  <div className="question-builder__preview">
                    <LivePreview values={values} />
                  </div>
                </div>
              </Form>
            );
          }}
        </Formik>
        <CustomLoadingAnimation isLoading={Loading} />
        <Modal show={showPreviewModal} onHide={() => setShowPreviewModal(false)} size="xl" centered className="preview-modal">
          <Modal.Header closeButton><Modal.Title>Question Preview</Modal.Title></Modal.Header>
          <Modal.Body style={{ backgroundColor: '#f4f7f9', padding: '0' }}>
            {previewQuestionData && <QuestionPreview questionData={previewQuestionData} isModal={true} />}
          </Modal.Body>
        </Modal>
        <Modal show={paymentPlan} size="lg" centered>
          <Modal.Header><Modal.Title>Upgrade your plan</Modal.Title><CloseButton onClick={() => setPaymentPlan(false)} /></Modal.Header>
          <Plans />
        </Modal>
      </div>
    </>
  );
};

export default CreateCustomQuestion;
