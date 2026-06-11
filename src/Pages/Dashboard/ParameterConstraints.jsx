import React from 'react';
import { getConstraintFields } from '../../utils/helper';

const ALLOWED_CHARS_PRESETS = [
  { label: 'Lowercase a-z', value: 'lowercase', desc: 'a-z only' },
  { label: 'Uppercase A-Z', value: 'uppercase', desc: 'A-Z only' },
  { label: 'Digits 0-9', value: 'digits', desc: '0-9 only' },
  { label: 'Alphanumeric', value: 'alphanumeric', desc: 'a-z, A-Z, 0-9' },
  { label: 'Lowercase + Digits', value: 'lowercase_digits', desc: 'a-z, 0-9' },
  { label: 'All characters', value: 'all', desc: 'any character' },
];

const NumberField = ({
  label,
  fieldKey,
  value,
  setConstraint,
  placeholder,
}) => (
  <div>
    <label className="ccq-label">{label}</label>
    <input
      type="number"
      className="form-control form-control-sm"
      value={value ?? ''}
      placeholder={placeholder}
      onChange={(e) =>
        setConstraint(
          fieldKey,
          e.target.value === '' ? undefined : Number(e.target.value),
        )
      }
    />
  </div>
);

const ToggleField = ({
  label,
  fieldKey,
  value,
  setConstraint,
  tooltip,
}) => (
  <div className="ccq-toggle-field">
    <label className="d-flex align-items-center gap-2 mb-0">
      <input
        type="checkbox"
        checked={!!value}
        onChange={() => setConstraint(fieldKey, !value)}
      />

      <span>{label}</span>

      {tooltip && (
        <span title={tooltip} style={{ cursor: 'help' }}>
          ?
        </span>
      )}
    </label>
  </div>
);

const AllowedCharsSection = ({
  constraints,
  setConstraint,
}) => (
  <div className="col-12 mt-2">
    <label className="ccq-label">Allowed characters</label>

    <div className="row g-2">
      <div className="col-md-6">
        <label className="ccq-label">Preset</label>

        <select
          className="form-select form-select-sm"
          value={constraints.allowedChars?.preset ?? ''}
          onChange={(e) =>
            setConstraint('allowedChars', {
              ...constraints.allowedChars,
              preset: e.target.value || undefined,
            })
          }
        >
          <option value="">None</option>

          {ALLOWED_CHARS_PRESETS.map((preset) => (
            <option
              key={preset.value}
              value={preset.value}
            >
              {preset.label} — {preset.desc}
            </option>
          ))}
        </select>
      </div>

      <div className="col-md-6">
        <label className="ccq-label">
          Custom Regex
        </label>

        <input
          type="text"
          className="form-control form-control-sm"
          placeholder="^[a-z0-9_]+$"
          value={constraints.allowedChars?.customRegex ?? ''}
          onChange={(e) =>
            setConstraint('allowedChars', {
              ...constraints.allowedChars,
              customRegex:
                e.target.value || undefined,
            })
          }
        />
      </div>
    </div>
  </div>
);

const ParameterConstraints = ({
  param,
  index,
  setFieldValue,
}) => {
  const constraintType = getConstraintFields(
    param?.type,
  );

  const constraints = param?.constraints || {};

  const setConstraint = (key, value) => {
    setFieldValue(
      `inputType[${index}].constraints.${key}`,
      value,
    );
  };

  if (!constraintType) {
    return (
      <div className="text-muted small">
        Select parameter type first
      </div>
    );
  }

  if (constraintType === 'boolean') {
    return (
      <div className="text-muted small">
        No constraints available for boolean.
      </div>
    );
  }

  return (
    <div className="ccq-constraints mt-3">
      <div className="row g-2">

        {/* ARRAY */}

        {constraintType === 'array' && (
          <>
            <div className="col-md-3">
              <NumberField
                label="Min Size"
                fieldKey="minSize"
                value={constraints.minSize}
                setConstraint={setConstraint}
                placeholder="1"
              />
            </div>

            <div className="col-md-3">
              <NumberField
                label="Max Size"
                fieldKey="maxSize"
                value={constraints.maxSize}
                setConstraint={setConstraint}
                placeholder="10000"
              />
            </div>

            <div className="col-md-3">
              <NumberField
                label="Min Element"
                fieldKey="minElement"
                value={constraints.minElement}
                setConstraint={setConstraint}
                placeholder="-1000"
              />
            </div>

            <div className="col-md-3">
              <NumberField
                label="Max Element"
                fieldKey="maxElement"
                value={constraints.maxElement}
                setConstraint={setConstraint}
                placeholder="1000"
              />
            </div>
          </>
        )}

        {/* 2D ARRAY */}

        {constraintType === '2d_array' && (
          <>
            <div className="col-md-3">
              <NumberField
                label="Min Rows"
                fieldKey="minRows"
                value={constraints.minRows}
                setConstraint={setConstraint}
              />
            </div>

            <div className="col-md-3">
              <NumberField
                label="Max Rows"
                fieldKey="maxRows"
                value={constraints.maxRows}
                setConstraint={setConstraint}
              />
            </div>

            <div className="col-md-3">
              <NumberField
                label="Min Cols"
                fieldKey="minCols"
                value={constraints.minCols}
                setConstraint={setConstraint}
              />
            </div>

            <div className="col-md-3">
              <NumberField
                label="Max Cols"
                fieldKey="maxCols"
                value={constraints.maxCols}
                setConstraint={setConstraint}
              />
            </div>

            <div className="col-md-3">
              <NumberField
                label="Min Element"
                fieldKey="minElement"
                value={constraints.minElement}
                setConstraint={setConstraint}
              />
            </div>

            <div className="col-md-3">
              <NumberField
                label="Max Element"
                fieldKey="maxElement"
                value={constraints.maxElement}
                setConstraint={setConstraint}
              />
            </div>
          </>
        )}

        {/* NUMBER */}

        {constraintType === 'number' && (
          <>
            <div className="col-md-6">
              <NumberField
                label="Min Value"
                fieldKey="minValue"
                value={constraints.minValue}
                setConstraint={setConstraint}
              />
            </div>

            <div className="col-md-6">
              <NumberField
                label="Max Value"
                fieldKey="maxValue"
                value={constraints.maxValue}
                setConstraint={setConstraint}
              />
            </div>
          </>
        )}

        {/* STRING */}

        {constraintType === 'string' && (
          <>
            <div className="col-md-6">
              <NumberField
                label="Min Length"
                fieldKey="minLength"
                value={constraints.minLength}
                setConstraint={setConstraint}
              />
            </div>

            <div className="col-md-6">
              <NumberField
                label="Max Length"
                fieldKey="maxLength"
                value={constraints.maxLength}
                setConstraint={setConstraint}
              />
            </div>
          </>
        )}

        {(constraintType === 'string' ||
          param.type === 'array_char' ||
          param.type === '2d_array_char') && (
          <AllowedCharsSection
            constraints={constraints}
            setConstraint={setConstraint}
          />
        )}

        <div className="col-12 mt-3">
          <div className="d-flex flex-wrap gap-3">

            {constraintType === 'array' && (
              <>
                <ToggleField label="Sorted" fieldKey="isSorted" value={constraints.isSorted} setConstraint={setConstraint} />
                <ToggleField label="Unique Values" fieldKey="isUnique" value={constraints.isUnique} setConstraint={setConstraint} />
                <ToggleField label="Can Be Empty" fieldKey="canBeEmpty" value={constraints.canBeEmpty} setConstraint={setConstraint} />
                <ToggleField label="Positive Only" fieldKey="isPositiveOnly" value={constraints.isPositiveOnly} setConstraint={setConstraint} />
                <ToggleField label="Non Negative" fieldKey="isNonNegative" value={constraints.isNonNegative} setConstraint={setConstraint} />
              </>
            )}

            {constraintType === '2d_array' && (
              <>
                <ToggleField label="Square Matrix" fieldKey="isSquare" value={constraints.isSquare} setConstraint={setConstraint} />
                <ToggleField label="Symmetric" fieldKey="isSymmetric" value={constraints.isSymmetric} setConstraint={setConstraint} />
                <ToggleField label="Rows Sorted" fieldKey="isSorted" value={constraints.isSorted} setConstraint={setConstraint} />
                <ToggleField label="Can Be Empty" fieldKey="canBeEmpty" value={constraints.canBeEmpty} setConstraint={setConstraint} />
                <ToggleField label="Positive Only" fieldKey="isPositiveOnly" value={constraints.isPositiveOnly} setConstraint={setConstraint} />
                <ToggleField label="Non Negative" fieldKey="isNonNegative" value={constraints.isNonNegative} setConstraint={setConstraint} />
              </>
            )}

            {constraintType === 'number' && (
              <>
                <ToggleField label="Positive Only" fieldKey="isPositiveOnly" value={constraints.isPositiveOnly} setConstraint={setConstraint} />
                <ToggleField label="Non Negative" fieldKey="isNonNegative" value={constraints.isNonNegative} setConstraint={setConstraint} />
                <ToggleField label="Non Zero" fieldKey="isNonZero" value={constraints.isNonZero} setConstraint={setConstraint} />
              </>
            )}

            {constraintType === 'string' && (
              <>
                <ToggleField label="Can Be Empty" fieldKey="canBeEmpty" value={constraints.canBeEmpty} setConstraint={setConstraint} />
                <ToggleField label="Unique Chars" fieldKey="isUnique" value={constraints.isUnique} setConstraint={setConstraint} />
                <ToggleField label="Has Spaces" fieldKey="hasSpaces" value={constraints.hasSpaces} setConstraint={setConstraint} />
                <ToggleField label="Palindrome" fieldKey="isPalindrome" value={constraints.isPalindrome} setConstraint={setConstraint} />
                <ToggleField label="Case Sensitive" fieldKey="caseSensitive" value={constraints.caseSensitive} setConstraint={setConstraint} />
              </>
            )}

          </div>
        </div>

        {constraints.isSorted &&
          (constraintType === 'array' ||
            constraintType === '2d_array') && (
            <div className="col-12">
              <label>Sort Order</label>

              <select
                className="form-select"
                value={
                  constraints.sortOrder || ''
                }
                onChange={(e) =>
                  setConstraint(
                    'sortOrder',
                    e.target.value,
                  )
                }
              >
                <option value="">
                  Select
                </option>
                <option value="asc">
                  Ascending
                </option>
                <option value="desc">
                  Descending
                </option>
              </select>
            </div>
          )}
      </div>
    </div>
  );
};

export default ParameterConstraints;