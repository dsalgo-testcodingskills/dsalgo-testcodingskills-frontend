import Editor from '@monaco-editor/react';
import { ErrorMessage, Field, FieldArray, Form, Formik } from 'formik';
import React, { useEffect, useRef, useState } from 'react';
import ReactQuill from 'react-quill';
import { toast } from 'react-toastify';
import Select from 'react-select';
import { Checkbox } from '@material-ui/core';
import { useParams, useHistory } from 'react-router-dom';
import * as Yup from 'yup';
import { Modal, CloseButton } from 'react-bootstrap';
import CustomToast from '../../components/CustomToast/CustomToast';
import CustomLoadingAnimation from '../../components/CustomLoadingAnimation';
import QuestionInstructions from '../../components/QuestionInstructions/QuestionInstructions';
import Plans from '../MyPlans/Plans';
import {
  submitCustomQuestion,
  getCustomQuestionById,
  editCustomQuestions,
  validateReferenceSolution,
  publishQuestion,
} from '../../Services/api';
import { ALL_TAGS } from '../../utils/constants';
import './CreateCustomQuestion.scss';

// ─── Constants ────────────────────────────────────────────────────────────────

const INPUT_OUTPUT_TYPES = [
  '2d_array_int', '2d_array_char', 'array_int',
  'array_char', 'int', 'boolean', 'string',
];

const DIFFICULTY_OPTIONS = [
  { label: 'Easy',   value: 'easy'   },
  { label: 'Medium', value: 'medium' },
  { label: 'Hard',   value: 'hard'   },
];

// Default time/memory recommendations per difficulty
const DIFFICULTY_DEFAULTS = {
  easy:   { timeLimit: 1, memoryLimit: 256 },
  medium: { timeLimit: 2, memoryLimit: 256 },
  hard:   { timeLimit: 3, memoryLimit: 512 },
};

// Human readable constraint presets
// Behind the scenes these map to exact numbers
const SIZE_PRESETS = [
  { label: 'Small',  value: 'small',  size: 100,      desc: 'up to 100 elements'       },
  { label: 'Medium', value: 'medium', size: 10000,     desc: 'up to 10,000 elements'    },
  { label: 'Large',  value: 'large',  size: 1000000,   desc: 'up to 1,000,000 elements' },
];

const VALUE_PRESETS = [
  { label: 'Small',    value: 'small',    min: -100,       max: 100,       desc: '-100 to 100'         },
  { label: 'Standard', value: 'standard', min: -10000,     max: 10000,     desc: '-10,000 to 10,000'   },
  { label: 'Large',    value: 'large',    min: -1000000000, max: 1000000000, desc: '-10⁹ to 10⁹'       },
];

const STEPS = ['Basics', 'Signature', 'Test Cases', 'Verify & Publish'];

const SUGGESTED_TAGS = ['dynamic-programming', 'arrays', 'memoization', 'recursion', 'time-complexity'];

const DEFAULT_VALUES = {
  level: '',
  question: '',
  instructions: '',
  sampleQuestion: false,
  public: false,
  topics: [],
  topicInput: '',
  testCases: [{ input: [], output: '', hidden: false, type: 'manual' }],
  inputType: [{ type: '', paramName: '', constraints: {} }],
  outputType: '',
  constraints: { timeLimit: 2, memoryLimit: 256 },
  outputConstraints: { isOrdered: true, tolerance: 0, caseSensitive: true },
};

// ─── Validation Schema ────────────────────────────────────────────────────────

const validationSchemas = [
  // Step 1
  Yup.object().shape({
    level:        Yup.string().required('Difficulty is required'),
    question:     Yup.string().required('Question title is required'),
    instructions: Yup.string().required('Description is required'),
    topics:       Yup.array().min(1, 'At least one topic is required'),
  }),
  // Step 2
  Yup.object().shape({
    inputType: Yup.array().of(
      Yup.object().shape({
        type:      Yup.string().required('Input type is required'),
        paramName: Yup.string().required('Parameter name is required'),
      }),
    ).required(),
    outputType: Yup.string().required('Output type is required'),
  }),
  // Step 3
  Yup.object().shape({
    testCases: Yup.array().of(
      Yup.object().shape({
        input:  Yup.array().of(Yup.string().required('Input is required')).required(),
        output: Yup.string().required('Output is required'),
      }),
    ).required(),
  }),
  // Step 4 — no required fields, publish is optional action
  Yup.object().shape({}),
];

// Returns which constraint UI to show based on the selected input type
function getConstraintFields(type) {
  if (!type) return null;
  if (type.includes('2d_array')) return '2d_array';
  if (type.includes('array'))    return 'array';
  if (type === 'int' || type === 'float') return 'number';
  if (type === 'string')         return 'string';
  if (type === 'boolean')        return 'boolean';
  return null;
}

const StepIndicator = ({ currentStep, onStepClick }) => (
  <div className="ccq-steps d-flex align-items-center gap-2 mb-4">
    {STEPS.map((label, i) => (
      <React.Fragment key={i}>
        <button
          type="button"
          className={`ccq-step-btn ${i === currentStep ? 'ccq-step-btn--active' : ''} ${i < currentStep ? 'ccq-step-btn--done' : ''}`}
          onClick={() => i < currentStep && onStepClick(i)}
        >
          <span className="ccq-step-num">{i < currentStep ? '✓' : i + 1}</span>
          <span className="ccq-step-label">{label}</span>
        </button>
        {i < STEPS.length - 1 && (
          <div className={`ccq-step-line ${i < currentStep ? 'ccq-step-line--done' : ''}`} />
        )}
      </React.Fragment>
    ))}
  </div>
);

const ALLOWED_CHARS_PRESETS = [
  { label: 'Lowercase a-z',      value: 'lowercase',        desc: 'a-z only'      },
  { label: 'Uppercase A-Z',      value: 'uppercase',        desc: 'A-Z only'      },
  { label: 'Digits 0-9',         value: 'digits',           desc: '0-9 only'      },
  { label: 'Alphanumeric',       value: 'alphanumeric',     desc: 'a-z, A-Z, 0-9' },
  { label: 'Lowercase + Digits', value: 'lowercase_digits', desc: 'a-z, 0-9'      },
  { label: 'All characters',     value: 'all',              desc: 'any character'  },
];

const ToggleField = ({ label, fieldKey, value, setConstraint, tooltip }) => (
  <div className="ccq-toggle-field">
    <label className="d-flex align-items-center gap-2 mb-0 cursor-pointer">
      <div
        className={`ccq-toggle ${value ? 'ccq-toggle--on' : ''}`}
        onClick={() => setConstraint(fieldKey, !value)}
      >
        <div className="ccq-toggle__knob" />
      </div>
      <span className="ccq-label mb-0">{label}</span>
      {tooltip && <span className="ccq-tooltip" title={tooltip}>?</span>}
    </label>
  </div>
);

const NumberField = ({ label, fieldKey, value, setConstraint, placeholder }) => (
  <div>
    <label className="ccq-label">{label}</label>
    <input
      type="number"
      className="form-control form-control-sm"
      value={value ?? ''}
      placeholder={placeholder}
      onChange={e => setConstraint(fieldKey, e.target.value === '' ? undefined : Number(e.target.value))}
    />
  </div>
);

const AllowedCharsSection = ({ constraints, setConstraint }) => (
  <div className="col-12 mt-2">
    <label className="ccq-label">Allowed characters</label>
    <div className="row g-2">
      <div className="col-md-6">
        <label className="ccq-label">Preset</label>
        <select
          className="form-select form-select-sm"
          value={constraints.allowedChars?.preset ?? ''}
          onChange={e => setConstraint('allowedChars', { ...constraints.allowedChars, preset: e.target.value || undefined })}
        >
          <option value="">None</option>
          {ALLOWED_CHARS_PRESETS.map(p => <option key={p.value} value={p.value}>{p.label} — {p.desc}</option>)}
        </select>
      </div>
      <div className="col-md-6">
        <label className="ccq-label">Custom regex <span className="ccq-type-badge">optional</span></label>
        <input
          type="text"
          className="form-control form-control-sm font-monospace"
          placeholder="e.g. ^[a-z0-9_]+$"
          value={constraints.allowedChars?.customRegex ?? ''}
          onChange={e => setConstraint('allowedChars', { ...constraints.allowedChars, customRegex: e.target.value || undefined })}
        />
      </div>
    </div>
  </div>
);

// Shows exact number inputs for all constraint fields.
// Covers all types: array_int, array_char, 2d_array_int, 2d_array_char,
// int, float, string, boolean.
const ConstraintInput = ({ paramIndex, param, setFieldValue }) => {
  const fields      = getConstraintFields(param.type);
  const constraints = param.constraints || {};
  const isFloat     = param.type === 'float';

  if (!fields || fields === 'boolean') {
    return <p className="text-muted small mt-1">No constraints needed for boolean type.</p>;
  }

  const set = (key, value) => setFieldValue(`inputType[${paramIndex}].constraints.${key}`, value);

  return (
    <div className="ccq-constraints mt-3">
      <span className="ccq-constraints__title">
        Constraints for <b>{param.paramName || 'this parameter'}</b>
        <span className="ccq-type-badge ms-2">{param.type}</span>
      </span>

      <div className="row g-2 mt-2">
        {fields === 'array' && <>
          <div className="col-6 col-md-3"><NumberField label="Min size"    fieldKey="minSize"    value={constraints.minSize}    setConstraint={set} placeholder="1"     /></div>
          <div className="col-6 col-md-3"><NumberField label="Max size"    fieldKey="maxSize"    value={constraints.maxSize}    setConstraint={set} placeholder="10000" /></div>
          <div className="col-6 col-md-3"><NumberField label="Min element" fieldKey="minElement" value={constraints.minElement} setConstraint={set} placeholder="-10⁹"  /></div>
          <div className="col-6 col-md-3"><NumberField label="Max element" fieldKey="maxElement" value={constraints.maxElement} setConstraint={set} placeholder="10⁹"   /></div>
        </>}

        {fields === '2d_array' && <>
          <div className="col-6 col-md-3"><NumberField label="Min rows"    fieldKey="minRows"    value={constraints.minRows}    setConstraint={set} placeholder="1"   /></div>
          <div className="col-6 col-md-3"><NumberField label="Max rows"    fieldKey="maxRows"    value={constraints.maxRows}    setConstraint={set} placeholder="100" /></div>
          <div className="col-6 col-md-3"><NumberField label="Min cols"    fieldKey="minCols"    value={constraints.minCols}    setConstraint={set} placeholder="1"   /></div>
          <div className="col-6 col-md-3"><NumberField label="Max cols"    fieldKey="maxCols"    value={constraints.maxCols}    setConstraint={set} placeholder="100" /></div>
          <div className="col-6 col-md-3"><NumberField label="Min element" fieldKey="minElement" value={constraints.minElement} setConstraint={set} placeholder="-10⁹"/></div>
          <div className="col-6 col-md-3"><NumberField label="Max element" fieldKey="maxElement" value={constraints.maxElement} setConstraint={set} placeholder="10⁹" /></div>
        </>}

        {fields === 'number' && <>
          <div className="col-6"><NumberField label="Min value" fieldKey="minValue" value={constraints.minValue} setConstraint={set} placeholder="-10⁹" /></div>
          <div className="col-6"><NumberField label="Max value" fieldKey="maxValue" value={constraints.maxValue} setConstraint={set} placeholder="10⁹"  /></div>
        </>}

        {isFloat && (
          <div className="col-6"><NumberField label="Decimal precision" fieldKey="decimalPrecision" value={constraints.decimalPrecision} setConstraint={set} placeholder="2" /></div>
        )}

        {fields === 'string' && <>
          <div className="col-6"><NumberField label="Min length" fieldKey="minLength" value={constraints.minLength} setConstraint={set} placeholder="0"     /></div>
          <div className="col-6"><NumberField label="Max length" fieldKey="maxLength" value={constraints.maxLength} setConstraint={set} placeholder="10000" /></div>
        </>}

        {(fields === 'string' || param.type === 'array_char' || param.type === '2d_array_char') && (
          <AllowedCharsSection constraints={constraints} setConstraint={set} />
        )}

        <div className="col-12 mt-1">
          <label className="ccq-label">Structural properties</label>
          <div className="d-flex flex-wrap gap-3 mt-1">
            {fields === 'array' && <>
              <ToggleField label="Sorted"         fieldKey="isSorted"       value={constraints.isSorted}       setConstraint={set} tooltip="Array is always pre-sorted"  />
              <ToggleField label="Unique values"  fieldKey="isUnique"       value={constraints.isUnique}       setConstraint={set} tooltip="No duplicate elements"        />
              <ToggleField label="Can be empty"   fieldKey="canBeEmpty"     value={constraints.canBeEmpty}     setConstraint={set} tooltip="Array length can be 0"        />
              <ToggleField label="Positive only"  fieldKey="isPositiveOnly" value={constraints.isPositiveOnly} setConstraint={set} tooltip="All elements > 0"             />
              <ToggleField label="Non-negative"   fieldKey="isNonNegative"  value={constraints.isNonNegative}  setConstraint={set} tooltip="All elements >= 0"            />
            </>}
            {fields === '2d_array' && <>
              <ToggleField label="Square matrix"  fieldKey="isSquare"       value={constraints.isSquare}       setConstraint={set} tooltip="rows always equal cols"       />
              <ToggleField label="Symmetric"      fieldKey="isSymmetric"    value={constraints.isSymmetric}    setConstraint={set} tooltip="matrix[i][j] === matrix[j][i]"/>
              <ToggleField label="Rows sorted"    fieldKey="isSorted"       value={constraints.isSorted}       setConstraint={set} tooltip="Each row is sorted"           />
              <ToggleField label="Can be empty"   fieldKey="canBeEmpty"     value={constraints.canBeEmpty}     setConstraint={set}                                        />
              <ToggleField label="Positive only"  fieldKey="isPositiveOnly" value={constraints.isPositiveOnly} setConstraint={set} tooltip="All elements > 0"             />
              <ToggleField label="Non-negative"   fieldKey="isNonNegative"  value={constraints.isNonNegative}  setConstraint={set} tooltip="All elements >= 0"            />
            </>}
            {fields === 'number' && <>
              <ToggleField label="Positive only"  fieldKey="isPositiveOnly" value={constraints.isPositiveOnly} setConstraint={set} tooltip="Always > 0"  />
              <ToggleField label="Non-negative"   fieldKey="isNonNegative"  value={constraints.isNonNegative}  setConstraint={set} tooltip="Always >= 0" />
              <ToggleField label="Non-zero"       fieldKey="isNonZero"      value={constraints.isNonZero}      setConstraint={set} tooltip="Never 0"     />
            </>}
            {fields === 'string' && <>
              <ToggleField label="Can be empty"    fieldKey="canBeEmpty"    value={constraints.canBeEmpty}    setConstraint={set}                                      />
              <ToggleField label="Unique chars"    fieldKey="isUnique"      value={constraints.isUnique}      setConstraint={set} tooltip="No duplicate characters"    />
              <ToggleField label="Has spaces"      fieldKey="hasSpaces"     value={constraints.hasSpaces}     setConstraint={set}                                      />
              <ToggleField label="Is palindrome"   fieldKey="isPalindrome"  value={constraints.isPalindrome}  setConstraint={set}                                      />
              <ToggleField label="Case sensitive"  fieldKey="caseSensitive" value={constraints.caseSensitive} setConstraint={set}                                      />
            </>}
          </div>
        </div>

        {constraints.isSorted && (fields === 'array' || fields === '2d_array') && (
          <div className="col-12">
            <label className="ccq-label">Sort order</label>
            <div className="d-flex gap-2">
              {['asc', 'desc'].map(order => (
                <button key={order} type="button"
                  className={`ccq-time-btn ${constraints.sortOrder === order ? 'ccq-time-btn--active' : ''}`}
                  onClick={() => set('sortOrder', order)}>
                  {order === 'asc' ? '↑ Ascending' : '↓ Descending'}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


const PresetButtons = ({ label, presets, activeValue, onSelect }) => (
  <div className="col-12">
    <label className="ccq-label">{label}</label>
    <div className="d-flex gap-2 flex-wrap">
      {presets.map(preset => (
        <button
          key={preset.value}
          type="button"
          className={`ccq-preset-btn ${activeValue === preset.value || activeValue === preset.size || activeValue === preset.max ? 'ccq-preset-btn--active' : ''}`}
          onClick={() => onSelect(preset)}
        >
          <span className="ccq-preset-label">{preset.label}</span>
          <span className="ccq-preset-desc">{preset.desc}</span>
        </button>
      ))}
    </div>
  </div>
);



const OutputConstraintsSection = ({ values, setFieldValue }) => {
  const outputConstraints = values.outputConstraints || {};
  const outputType = values.outputType;

  const set = (key, value) => setFieldValue(`outputConstraints.${key}`, value);

  const isArrayOutput  = outputType === 'array_int' || outputType === 'array_char' || outputType === '2d_array_int' || outputType === '2d_array_char';
  const isFloatOutput  = outputType === 'float';
  const isStringOutput = outputType === 'string';

  if (!outputType) return null;

  return (
    <div className="ccq-param-card mt-3">
      <div className="ccq-param-card__header">
        <span className="ccq-param-card__title">Output comparison rules</span>
        <span className="ccq-type-badge">{outputType}</span>
      </div>

      <div className="d-flex flex-wrap gap-3 mt-2">
        {isArrayOutput && (
          <ToggleField
            label="Order matters"
            fieldKey="isOrdered"
            value={outputConstraints.isOrdered ?? true}
            setConstraint={set}
            tooltip="Turn OFF for problems like Two Sum where [0,1] and [1,0] are both valid"
          />
        )}
        {isStringOutput && (
          <ToggleField
            label="Case sensitive"
            fieldKey="caseSensitive"
            value={outputConstraints.caseSensitive ?? true}
            setConstraint={set}
            tooltip="Turn OFF to accept 'Hello' and 'hello' as equal"
          />
        )}
        {isFloatOutput && (
          <div>
            <label className="ccq-label">
              Float tolerance
              <span className="ccq-tooltip ms-1" title="Acceptable difference between actual and expected. e.g. 0.001 means ±0.001 is accepted">?</span>
            </label>
            <div className="d-flex gap-2">
              {[0, 0.001, 0.0001, 0.00001].map(t => (
                <button key={t} type="button"
                  className={`ccq-time-btn ${(outputConstraints.tolerance ?? 0) === t ? 'ccq-time-btn--active' : ''}`}
                  onClick={() => set('tolerance', t)}>
                  {t === 0 ? 'Exact' : `±${t}`}
                </button>
              ))}
              <input
                type="number"
                step="0.00001"
                className="form-control form-control-sm"
                style={{ width: '100px' }}
                placeholder="custom"
                value={[0, 0.001, 0.0001, 0.00001].includes(outputConstraints.tolerance ?? 0) ? '' : (outputConstraints.tolerance ?? '')}
                onChange={e => set('tolerance', parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>
        )}
      </div>

      {isArrayOutput && (outputConstraints.isOrdered === false) && (
        <div className="ccq-testcase-hint mt-2">
          💡 Both <code>[0,1]</code> and <code>[1,0]</code> will be accepted as correct answers
        </div>
      )}
      {isFloatOutput && (outputConstraints.tolerance ?? 0) > 0 && (
        <div className="ccq-testcase-hint mt-2">
          💡 Answers within ±{outputConstraints.tolerance} of the expected value will be accepted
        </div>
      )}
    </div>
  );
};


const LivePreview = ({ values }) => {
  const difficultyColor = {
    easy: '#00b85c', medium: '#f5a623', hard: '#e74c3c',
  };

  return (
    <div className="ccq-preview">
      <div className="ccq-preview__header">
        <span className="ccq-preview__label">Live Preview</span>
        <span className="ccq-preview__sub">As candidate will see it</span>
      </div>

      <div className="ccq-preview__body">
        <div className="d-flex align-items-center gap-2 mb-2">
          <h5 className="ccq-preview__title mb-0">
            {values.question || <span className="text-muted">Question title...</span>}
          </h5>
          {values.level && (
            <span className="ccq-preview__badge" style={{ background: difficultyColor[values.level] + '20', color: difficultyColor[values.level] }}>
              {values.level}
            </span>
          )}
        </div>

        {values.topics?.length > 0 && (
          <div className="d-flex flex-wrap gap-1 mb-3">
            {values.topics.map((t, i) => (
              <span key={i} className="ccq-preview__topic">{t}</span>
            ))}
          </div>
        )}

        {values.instructions ? (
          <div className="ccq-preview__instructions"
            dangerouslySetInnerHTML={{ __html: values.instructions }} />
        ) : (
          <p className="text-muted small">Description will appear here...</p>
        )}

        {(values.constraints?.timeLimit || values.constraints?.memoryLimit) && (
          <div className="ccq-preview__constraints mt-3">
            <b>Constraints</b>
            <ul className="ccq-preview__constraint-list mt-1">
              {values.inputType?.map((p, i) => {
                const c = p.constraints || {};
                const fields = getConstraintFields(p.type);
                if (!p.paramName || !fields || fields === 'boolean') return null;
                return (
                  <React.Fragment key={i}>
                    
                    {(fields === 'array') && c.maxSize &&
                      <li>{c.minSize ?? 1} ≤ {p.paramName}.length ≤ {c.maxSize.toLocaleString()}</li>}
                    
                    {(fields === 'array') && c.maxElement !== undefined &&
                      <li>{c.minElement ?? '-10⁹'} ≤ {p.paramName}[i] ≤ {c.maxElement.toLocaleString()}</li>}
                    
                    {fields === '2d_array' && c.maxRows &&
                      <li>{c.minRows ?? 1} ≤ {p.paramName}.rows ≤ {c.maxRows.toLocaleString()}</li>}
                    {fields === '2d_array' && c.maxCols &&
                      <li>{c.minCols ?? 1} ≤ {p.paramName}.cols ≤ {c.maxCols.toLocaleString()}</li>}
                    {fields === '2d_array' && c.maxElement !== undefined &&
                      <li>{c.minElement ?? '-10⁹'} ≤ {p.paramName}[i][j] ≤ {c.maxElement.toLocaleString()}</li>}
                    
                    {fields === 'number' && c.maxValue !== undefined &&
                      <li>{c.minValue ?? '-10⁹'} ≤ {p.paramName} ≤ {c.maxValue.toLocaleString()}</li>}
                     {fields=== 'string' && c.maxLength &&
                      <li>{c.minLength ?? 0} ≤ {p.paramName}.length ≤ {c.maxLength.toLocaleString()}</li>}
                    
                    {c.isSorted     && <li>{p.paramName} is sorted {c.sortOrder === 'desc' ? 'descending' : 'ascending'}</li>}
                    {c.isUnique     && <li>All elements in {p.paramName} are unique</li>}
                    {c.isSquare     && <li>{p.paramName} is always a square matrix</li>}
                    {c.isSymmetric  && <li>{p.paramName} is symmetric</li>}
                    {c.isPositiveOnly && <li>All values in {p.paramName} are positive</li>}
                    {c.isPalindrome && <li>{p.paramName} is always a palindrome</li>}
                    {c.allowedChars?.preset && <li>{p.paramName} contains only {c.allowedChars.preset} characters</li>}
                  </React.Fragment>
                );
              })}
              <li>Time limit: {values.constraints.timeLimit}s</li>
              <li>Memory limit: {values.constraints.memoryLimit}MB</li>
              {values.outputConstraints?.isOrdered === false && <li>Output order does not matter</li>}
              {values.outputConstraints?.tolerance > 0 && <li>Float tolerance: ±{values.outputConstraints.tolerance}</li>}
              {values.outputConstraints?.caseSensitive === false && <li>Output comparison is case insensitive</li>}
            </ul>
          </div>
        )}

        {values.testCases?.filter(tc => !tc.hidden && tc.output).length > 0 && (
          <div className="mt-3">
            <b>Examples</b>
            {values.testCases.filter(tc => !tc.hidden && tc.output).slice(0, 2).map((tc, i) => (
              <div key={i} className="ccq-preview__example mt-2">
                <div className="small text-muted">Input:</div>
                <div className="ccq-preview__code">{Array.isArray(tc.input) ? tc.input.join(', ') : tc.input}</div>
                <div className="small text-muted mt-1">Output:</div>
                <div className="ccq-preview__code">{tc.output}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};


const CreateCustomQuestion = () => {
  const params = useParams();
  const history = useHistory();

  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [paymentPlan, setPaymentPlan] = useState(false);
  const [initialValues, setInitialValues] = useState(DEFAULT_VALUES);
  const [savedQuestionId, setSavedQuestionId] = useState(null);

  const [refLanguage, setRefLanguage] = useState(null);
  const [refCode, setRefCode] = useState('');
  const [validateResults, setValidateResults] = useState(null);
  const [validationPassed, setValidationPassed] = useState(false);
  const [publishLoading, setPublishLoading] = useState(false);
  const [validateLoading, setValidateLoading] = useState(false);
  const [languageOptions, setLanguageOptions] = useState([]);

  const [filteredTags, setFilteredTags] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const typeOptions = INPUT_OUTPUT_TYPES.map(t => ({ label: t, value: t }));

  const quillModules = {
    toolbar: [
      [{ header: '1' }, { header: '2' }, { font: [] }],
      [{ size: [] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['clean'], ['code-block'],
    ],
  };

  const quillFormats = [
    'header', 'font', 'size', 'bold', 'italic', 'underline',
    'strike', 'blockquote', 'list', 'bullet', 'code-block',
  ];

  useEffect(() => {
    if (params.id) {
      setEditMode(true);
      loadQuestion(params.id);
    }
  }, []);

  const loadQuestion = async (id) => {
    try {
      setLoading(true);
      const res = await getCustomQuestionById(id);
      if (res?.data?.data) {
        const data = res.data.data;
        // Parse test case inputs back to strings for the form
        for (let i = 0; i < data.testCases.length; i++) {
          for (let j = 0; j < data.testCases[i].input.length; j++) {
            data.testCases[i].input[j] = JSON.stringify(data.testCases[i].input[j]);
          }
          data.testCases[i].output = JSON.stringify(data.testCases[i].output);
        }
        if (typeof data.topics === 'string') {
          data.topics = data.topics.split(',').filter(t => t.trim());
        }
        setInitialValues({ ...DEFAULT_VALUES, ...data, topicInput: '' });
        setSavedQuestionId(id);

        // Set up language options for step 4
        if (data.solutionTemplates?.length) {
          const opts = data.solutionTemplates.map(s => ({
            value: s.language,
            label: s.language.toUpperCase(),
            code: s.code,
          }));
          setLanguageOptions(opts);
          setRefLanguage(opts[0]);
          setRefCode(opts[0].code);
        }
      }
    } catch (err) {
      toast(<CustomToast type="error" message={err.message} />);
    } finally {
      setLoading(false);
    }
  };

  // ── Transform test cases before API call ──
  const transformTestCases = (testCases) => {
    const temp = JSON.parse(JSON.stringify(testCases));
    for (let i = 0; i < temp.length; i++) {
      for (let j = 0; j < temp[i].input.length; j++) {
        if (typeof temp[i].input[j] === 'string' && temp[i].input[j].trim()) {
          temp[i].input.splice(j, 1, JSON.parse(temp[i].input[j]));
        }
      }
      temp[i].input = JSON.stringify(temp[i].input);
    }
    return temp;
  };

  // ── Save question (create or update) ──
  const saveQuestion = async (values) => {
    try {
      setLoading(true);
      const { topicInput, ...rest } = values;
      const payload = { ...rest, testCases: transformTestCases(values.testCases) };

      let questionId = savedQuestionId;

      if (editMode && params.id) {
        await editCustomQuestions(params.id, payload);
        questionId = params.id;
        toast(<CustomToast type="success" message="Question updated. Please re-verify your reference solution." />);
      } else {
        const res = await submitCustomQuestion(payload);
        if (res?.data?.statusCode === 402) {
          setPaymentPlan(true);
          return false;
        }
        if (res?.data?.statusCode === 200) {
          questionId = res.data.data?._id || res.data.questionId;
          toast(<CustomToast type="success" message="Question saved as draft!" />);
        } else {
          toast(<CustomToast type="error" message={res?.data?.message} />);
          return false;
        }
      }

      setSavedQuestionId(questionId);

      // Build language options for step 4 from solutionTemplates
      const opts = values.inputType.map((_, i) => null).filter(Boolean);
      // Fetch updated question to get generated solution templates
      if (questionId) {
        const updated = await getCustomQuestionById(questionId);
        if (updated?.data?.data?.solutionTemplates) {
          const langOpts = updated.data.data.solutionTemplates.map(s => ({
            value: s.language,
            label: s.language.toUpperCase(),
            code: s.code,
          }));
          setLanguageOptions(langOpts);
          setRefLanguage(langOpts[0]);
          setRefCode(langOpts[0].code);
        }
      }

      return true;
    } catch (err) {
      toast(<CustomToast type="error" message={err.message} />);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = async () => {
    if (!savedQuestionId) {
      toast(<CustomToast type="error" message="Please save the question first (complete steps 1-3)" />);
      return;
    }
    if (!refCode || !refLanguage) {
      toast(<CustomToast type="error" message="Please write and select a reference solution" />);
      return;
    }
    try {
      setValidateLoading(true);
      setValidateResults(null);
      setValidationPassed(false);

      const res = await validateReferenceSolution({
        questionId: savedQuestionId,
        referenceSolution: { language: refLanguage.value, code: refCode },
      });

      setValidateResults(res.data);

      if (res.data?.statusCode === 200) {
        setValidationPassed(true);
        toast(<CustomToast type="success" message="All test cases passed! You can now publish." />);
      } else {
        toast(<CustomToast type="error" message={`${res.data?.data?.failed} test case(s) failed`} />);
      }
    } catch (err) {
      toast(<CustomToast type="error" message={err.message} />);
    } finally {
      setValidateLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!validationPassed) return;
    try {
      setPublishLoading(true);
      await publishQuestion({ questionId: savedQuestionId });
      toast(<CustomToast type="success" message="Question published successfully!" />);
      history.push('/admin/customQuestion');
    } catch (err) {
      toast(<CustomToast type="error" message={err.message} />);
    } finally {
      setPublishLoading(false);
    }
  };


  const renderStep1 = (values, setFieldValue) => (
    <div className="ccq-step-content">
      <h5 className="ccq-section-title">Question Details</h5>

      <div className="row g-3">
        <div className="col-12">
          <label className="ccq-label">Question Title *</label>
          <Field name="question" className="form-control" placeholder="e.g. Two Sum" />
          <ErrorMessage name="question" render={msg => <div className="ccq-error">{msg}</div>} />
        </div>

        <div className="col-md-6">
          <label className="ccq-label">Difficulty *</label>
          <Select
            options={DIFFICULTY_OPTIONS}
            value={DIFFICULTY_OPTIONS.find(o => o.value === values.level) || null}
            onChange={e => {
              setFieldValue('level', e.value);
              // Auto-apply recommended time/memory limits based on difficulty
              const defaults = DIFFICULTY_DEFAULTS[e.value];
              setFieldValue('constraints.timeLimit', defaults.timeLimit);
              setFieldValue('constraints.memoryLimit', defaults.memoryLimit);
            }}
            placeholder="Select difficulty"
          />
          <ErrorMessage name="level" render={msg => <div className="ccq-error">{msg}</div>} />
        </div>

        <div className="col-md-6">
          <label className="ccq-label">Visibility</label>
          <div className="d-flex gap-3 align-items-center mt-2">
            <label className="d-flex align-items-center gap-1 ccq-checkbox-label">
              <Checkbox
                checked={values.public}
                onChange={e => setFieldValue('public', e.target.checked)}
                size="small"
              />
              Public question
            </label>
            <label className="d-flex align-items-center gap-1 ccq-checkbox-label">
              <Checkbox
                checked={values.sampleQuestion}
                onChange={e => setFieldValue('sampleQuestion', e.target.checked)}
                size="small"
              />
              Sample question
            </label>
          </div>
        </div>

        <div className="col-12">
          <label className="ccq-label">Description *</label>
          <Field name="instructions">
            {({ field }) => (
              <ReactQuill
                modules={quillModules}
                formats={quillFormats}
                onChange={field.onChange(field.name)}
                value={field.value}
                placeholder="Describe the problem clearly..."
              />
            )}
          </Field>
          <ErrorMessage name="instructions" render={msg => <div className="ccq-error">{msg}</div>} />
        </div>

        {/* Tags */}
        <div className="col-12">
          <label className="ccq-label">Topics / Tags *</label>
          <p className="text-muted small mb-2">Add up to 5 tags. Start typing to search.</p>
          <div className="topic-wrapper">
            <div className="topic-input-box" onClick={() => document.getElementById('topicInputField')?.focus()}>
              {values.topics.map((topic, i) => (
                <div key={i} className="topic-chip">
                  <span>{topic}</span>
                  <button type="button" className="topic-chip__remove"
                    onClick={() => setFieldValue('topics', values.topics.filter((_, idx) => idx !== i))}>✕</button>
                </div>
              ))}
              <input
                id="topicInputField"
                className="topic-chip-input"
                value={values.topicInput}
                placeholder={values.topics.length === 0 ? 'e.g. arrays' : ''}
                disabled={values.topics.length >= 5}
                onChange={e => {
                  setFieldValue('topicInput', e.target.value);
                  if (e.target.value.trim()) {
                    const filtered = ALL_TAGS.filter(tag =>
                      tag.name.toLowerCase().includes(e.target.value.toLowerCase())
                    ).slice(0, 8);
                    setFilteredTags(filtered);
                    setShowDropdown(true);
                  } else {
                    setShowDropdown(false);
                  }
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter' && values.topicInput.trim()) {
                    e.preventDefault();
                    if (!values.topics.includes(values.topicInput.trim()) && values.topics.length < 5) {
                      setFieldValue('topics', [...values.topics, values.topicInput.trim()]);
                      setFieldValue('topicInput', '');
                      setShowDropdown(false);
                    }
                  }
                }}
              />
            </div>
            {showDropdown && filteredTags.length > 0 && (
              <div className="topic-dropdown">
                {filteredTags.map((tag, i) => (
                  <div key={i} className="topic-dropdown__item"
                    onMouseDown={() => {
                      if (!values.topics.includes(tag.name) && values.topics.length < 5) {
                        setFieldValue('topics', [...values.topics, tag.name]);
                        setFieldValue('topicInput', '');
                        setShowDropdown(false);
                      }
                    }}>
                    <span>{tag.name}</span>
                    <span className="topic-dropdown__cat">{tag.cat}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="d-flex flex-wrap gap-1 mt-2">
              {SUGGESTED_TAGS.map(tag => (
                <span key={tag}
                  className={`topic-suggested-chip ${values.topics.includes(tag) ? 'topic-suggested-chip--used' : ''}`}
                  onClick={() => {
                    if (!values.topics.includes(tag) && values.topics.length < 5)
                      setFieldValue('topics', [...values.topics, tag]);
                  }}>{tag}</span>
              ))}
            </div>
            <div className="topic-count mt-1">Tags: <b>{values.topics.length}</b>/5</div>
          </div>
          <ErrorMessage name="topics" render={msg => <div className="ccq-error">{msg}</div>} />
        </div>
      </div>
    </div>
  );

  // ─── Step 2: Function Signature + Constraints ─────────────────────────────

  const renderStep2 = (values, setFieldValue) => (
    <div className="ccq-step-content">
      <h5 className="ccq-section-title">Function Signature</h5>
      <p className="text-muted small mb-3">Define inputs and output. Solution templates will be auto-generated for all languages.</p>

      <FieldArray name="inputType">
        {({ remove, push }) => (
          <div>
            {values.inputType.map((param, i) => (
              <div key={i} className="ccq-param-card mb-3">
                <div className="ccq-param-card__header">
                  <span className="ccq-param-card__title">Parameter {i + 1}</span>
                  {values.inputType.length > 1 && (
                    <button type="button" className="ccq-remove-btn"
                      onClick={() => {
                        remove(i);
                        values.testCases.forEach((_, ti) =>
                          values.testCases[ti].input.splice(i, 1)
                        );
                      }}>Remove</button>
                  )}
                </div>
                <div className="row g-2">
                  <div className="col-md-5">
                    <label className="ccq-label">Type *</label>
                    <Select
                      options={typeOptions}
                      value={typeOptions.find(o => o.value === param.type) || null}
                      onChange={e => setFieldValue(`inputType[${i}].type`, e.value)}
                      placeholder="Select type"
                    />
                    <ErrorMessage name={`inputType[${i}].type`} render={msg => <div className="ccq-error">{msg}</div>} />
                  </div>
                  <div className="col-md-7">
                    <label className="ccq-label">Parameter name *</label>
                    <Field
                      name={`inputType[${i}].paramName`}
                      className="form-control"
                      placeholder="e.g. nums"
                    />
                    <ErrorMessage name={`inputType[${i}].paramName`} render={msg => <div className="ccq-error">{msg}</div>} />
                  </div>
                </div>

                {/* Constraints per parameter */}
                {param.type && (
                  <ConstraintInput
                    paramIndex={i}
                    param={param}
                    values={values}
                    setFieldValue={setFieldValue}
                  />
                )}
              </div>
            ))}
            <button type="button" className="ccq-add-btn"
              onClick={() => push({ type: '', paramName: '', constraints: {} })}>
              + Add Parameter
            </button>
          </div>
        )}
      </FieldArray>

      {/* Output type */}
      <div className="mt-4">
        <h5 className="ccq-section-title">Output</h5>
        <div className="col-md-6">
          <label className="ccq-label">Return type *</label>
          <Select
            options={typeOptions}
            value={typeOptions.find(o => o.value === values.outputType) || null}
            onChange={e => setFieldValue('outputType', e.value)}
            placeholder="Select output type"
          />
          <ErrorMessage name="outputType" render={msg => <div className="ccq-error">{msg}</div>} />
        </div>

        {/* Output comparison rules — shown as soon as output type is selected */}
        <OutputConstraintsSection values={values} setFieldValue={setFieldValue} />
      </div>

      {/* Question-level constraints */}
      <div className="mt-4">
        <h5 className="ccq-section-title">Execution Limits</h5>
        <p className="text-muted small mb-3">
          {values.level
            ? `Recommended for ${values.level}: ${DIFFICULTY_DEFAULTS[values.level]?.timeLimit}s / ${DIFFICULTY_DEFAULTS[values.level]?.memoryLimit}MB`
            : 'Set difficulty in Step 1 to see recommendations'}
        </p>
        <div className="row g-3">
          <div className="col-md-6">
            <label className="ccq-label">Time limit (seconds)</label>
            <div className="d-flex gap-2">
              {[1, 2, 3, 5].map(t => (
                <button key={t} type="button"
                  className={`ccq-time-btn ${values.constraints?.timeLimit === t ? 'ccq-time-btn--active' : ''}`}
                  onClick={() => setFieldValue('constraints.timeLimit', t)}>
                  {t}s
                </button>
              ))}
            </div>
          </div>
          <div className="col-md-6">
            <label className="ccq-label">Memory limit (MB)</label>
            <div className="d-flex gap-2">
              {[128, 256, 512].map(m => (
                <button key={m} type="button"
                  className={`ccq-time-btn ${values.constraints?.memoryLimit === m ? 'ccq-time-btn--active' : ''}`}
                  onClick={() => setFieldValue('constraints.memoryLimit', m)}>
                  {m}MB
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ─── Step 3: Test Cases ───────────────────────────────────────────────────

  const renderStep3 = (values, setFieldValue) => (
    <div className="ccq-step-content">
      <h5 className="ccq-section-title">Test Cases</h5>
      <p className="text-muted small mb-1">
        Note: String or character values must be in double quotes e.g. <code>&quot;hello&quot;</code>
      </p>

      <FieldArray name="testCases">
        {({ remove, push }) => (
          <div>
            {values.testCases.map((tc, index) => (
              <div key={index} className={"ccq-testcase-card mb-3"}>
                <div className="ccq-testcase-card__header">
                  <span className="ccq-testcase-card__num">
                    Test Case {index + 1}
                  </span>
                  <div className="d-flex align-items-center gap-2">
                    <label className="d-flex align-items-center gap-1 ccq-checkbox-label small">
                      <Checkbox
                        size="small"
                        checked={tc.hidden}
                        onChange={e => setFieldValue(`testCases[${index}].hidden`, e.target.checked)}
                      />
                      Hidden
                    </label>
                    {values.testCases.length > 1 && (
                      <button type="button" className="ccq-remove-btn" onClick={() => remove(index)}>Remove</button>
                    )}
                  </div>
                </div>

                <div className="row g-2">
                  {/* Inputs — one field per inputType parameter */}
                  <div className="col-md-7">
                    {values.inputType.map((type, inputIndex) => (
                      <div key={inputIndex} className="mb-2">
                        <label className="ccq-label">
                          Input: <b>{type.paramName || `param${inputIndex + 1}`}</b>
                          {type.type && <span className="ccq-type-badge ms-1">{type.type}</span>}
                        </label>
                        <Field
                          name={`testCases[${index}].input[${inputIndex}]`}
                          className="form-control form-control-sm font-monospace"
                          placeholder={type.type?.includes('array') ? '[1, 2, 3]' : '0'}
                          onChange={e => setFieldValue(`testCases[${index}].input[${inputIndex}]`, e.target.value)}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="col-md-5">
                    <label className="ccq-label">Expected Output</label>
                    <Field
                      name={`testCases[${index}].output`}
                      className="form-control form-control-sm font-monospace"
                      placeholder="Expected result"
                    />
                    <ErrorMessage name={`testCases[${index}].output`} render={msg => <div className="ccq-error">{msg}</div>} />
                  </div>
                </div>
              </div>
            ))}

            {/* Add buttons */}
            <div className="d-flex gap-2 flex-wrap mt-3">
              <button type="button" className="ccq-add-btn"
                onClick={() => push({ input: values.inputType.map(() => ''), output: '', hidden: false })}>
                + Add Test Case
              </button>
            </div>
          </div>
        )}
      </FieldArray>
    </div>
  );

  // ─── Step 4: Reference Solution + Publish ────────────────────────────────

  const renderStep4 = () => (
    <div className="ccq-step-content">
      <h5 className="ccq-section-title">Verify & Publish</h5>
      <p className="text-muted small mb-3">
        Write a correct solution and run it against all test cases.
        All must pass before you can publish.
      </p>

      {!savedQuestionId && (
        <div className="alert alert-warning">
          ⚠️ Question not yet saved. Complete Steps 1–3 and click &quot;Save &amp; Continue&quot;.
        </div>
      )}

      <div className="row g-3">
        <div className="col-md-4">
          <label className="ccq-label">Language</label>
          <Select
            options={languageOptions}
            value={refLanguage}
            onChange={e => {
              setRefLanguage(e);
              setRefCode(e.code);
            }}
            placeholder="Select language"
          />
        </div>
      </div>

      <div className="mt-3">
        <Editor
          height="50vh"
          theme="vs-dark"
          language={refLanguage?.value}
          value={refCode}
          onChange={val => setRefCode(val || '')}
          options={{
            minimap: { enabled: false },
            tabSize: 2,
            wordWrap: 'on',
            formatOnType: true,
            padding: { top: 16, bottom: 16 },
          }}
          className="border rounded"
        />
      </div>

      <div className="d-flex gap-3 mt-3 align-items-center">
        <button
          type="button"
          className="btns"
          onClick={handleValidate}
          disabled={validateLoading || !savedQuestionId}
        >
          {validateLoading ? 'Running...' : '▶ Run All Test Cases'}
        </button>

        {validationPassed && (
          <button
            type="button"
            className="btns btns--success"
            onClick={handlePublish}
            disabled={publishLoading}
          >
            {publishLoading ? 'Publishing...' : '🚀 Publish Question'}
          </button>
        )}

        {validateResults && !validationPassed && (
          <span className="text-danger small">
            {validateResults.data?.failed} test case(s) failed — fix and re-run
          </span>
        )}
      </div>

      {/* Validation results */}
      {validateResults && (
        <div className="mt-4">
          <div className="d-flex gap-3 mb-3">
            <span className="ccq-stat ccq-stat--pass">
              ✓ {validateResults.data?.passed} passed
            </span>
            {validateResults.data?.failed > 0 && (
              <span className="ccq-stat ccq-stat--fail">
                ✗ {validateResults.data?.failed} failed
              </span>
            )}
          </div>

          {/* Execution stats (time + memory per test case) */}
          {validateResults.data?.executionStats && (
            <div className="ccq-exec-stats">
              <b className="small">Execution stats (use to fine-tune time/memory limits)</b>
              <div className="d-flex flex-wrap gap-2 mt-2">
                {validateResults.data.executionStats.map((s, i) => (
                  <div key={i} className="ccq-exec-stat-card">
                    <span className="small">TC {s.testCase}</span>
                    <span className="small text-muted">{s.time}s / {s.memory}KB</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Failed test cases */}
          {validateResults.data?.failedCases?.map((f, i) => (
            <div key={i} className="ccq-testcase-card ccq-testcase-card--failed mt-2 p-3">
              <b className="small text-danger">Test Case {f.index + 1} Failed</b>
              {f.input !== '[hidden]' && (
                <div className="small text-muted mt-1">Input: <code>{JSON.stringify(f.input)}</code></div>
              )}
              {f.actualOutput && (
                <div className="small text-muted">Your output: <code>{f.actualOutput}</code></div>
              )}
              {f.logs && (
                <pre className="ccq-logs mt-1">{f.logs}</pre>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // ─── Main render ──────────────────────────────────────────────────────────

  return (
    <>
      <label className="head">
        <span onClick={() => history.push('/admin/testStatus')} style={{ cursor: 'pointer' }}>Dashboard</span>
        <span onClick={() => history.push('/admin/customQuestion')} style={{ cursor: 'pointer' }}>&nbsp;/ Custom Questions</span>
        &nbsp;/ {editMode ? 'Edit Question' : 'Create Question'}
      </label>

      <div className="createCustomQuestion py-3 mt-4">
        <div className="d-flex mb-3 mx-2">
          <button className="btn btn-secondary rounded-pill px-4" onClick={() => history.goBack()}>
            <i className="fas fa-arrow-left"></i>&nbsp;&nbsp;Go Back
          </button>
        </div>

        <div className="card-title mt-2 card-header-text" style={{ marginLeft: '20px' }}>
          {editMode ? 'Edit Custom Question' : 'Create Custom Question'}
        </div>

        <Formik
          enableReinitialize
          initialValues={initialValues}
          validationSchema={validationSchemas[currentStep]}
          onSubmit={() => {}} // handled manually per step
        >
          {({ values, setFieldValue, validateForm, setTouched }) => (
            <Form>
              <div className="ccq-layout mt-3">
                {/* ── Left: form ── */}
                <div className="ccq-layout__form">
                  <StepIndicator currentStep={currentStep} onStepClick={setCurrentStep} />

                  {currentStep === 0 && renderStep1(values, setFieldValue)}
                  {currentStep === 1 && renderStep2(values, setFieldValue)}
                  {currentStep === 2 && renderStep3(values, setFieldValue)}
                  {currentStep === 3 && renderStep4()}

                  {/* Navigation */}
                  <div className="d-flex justify-content-between mt-4 pt-3 border-top">
                    <button
                      type="button"
                      className="btn btn-secondary rounded-pill px-4"
                      onClick={() => setCurrentStep(s => Math.max(0, s - 1))}
                      disabled={currentStep === 0}
                    >
                      ← Back
                    </button>

                    {currentStep < 3 ? (
                      <button
                        type="button"
                        className="btns px-4"
                        onClick={async () => {
                          const errors = await validateForm();
                          if (Object.keys(errors).length > 0) {
                            // Touch all fields to show errors
                            const touched = {};
                            Object.keys(errors).forEach(k => touched[k] = true);
                            setTouched(touched);
                            return;
                          }
                          // On step 2→3 transition, save question to backend
                          if (currentStep === 2) {
                            const saved = await saveQuestion(values);
                            if (!saved) return;
                          }
                          setCurrentStep(s => s + 1);
                        }}
                      >
                        {currentStep === 2 ? 'Save & Continue →' : 'Next →'}
                      </button>
                    ) : null}
                  </div>
                </div>

                {/* ── Right: live preview ── */}
                <div className="ccq-layout__preview">
                  <LivePreview values={values} />
                </div>
              </div>
            </Form>
          )}
        </Formik>

        <CustomLoadingAnimation isLoading={loading} />
      </div>

      {/* Subscription modal */}
      <Modal show={paymentPlan} size="lg" centered>
        <Modal.Header>
          <Modal.Title>Upgrade your plan</Modal.Title>
          <CloseButton onClick={() => setPaymentPlan(false)} />
        </Modal.Header>
        <Plans />
      </Modal>
    </>
  );
};

export default CreateCustomQuestion;