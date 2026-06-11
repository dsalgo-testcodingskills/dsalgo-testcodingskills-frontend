import React from 'react';
import { getConstraintFields } from '../../utils/helper';

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
          <div className="ccq-preview__instructions" style={{ whiteSpace: 'pre-wrap' }}>
            {values.instructions}
          </div>
        ) : (
          <p className="text-muted small">Description will appear here...</p>
        )}

        {(values.constraints?.timeLimit || values.constraints?.memoryLimit || values.inputType?.length > 0) && (
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
              {values.constraints?.timeLimit && <li>Time limit: {values.constraints.timeLimit}ms</li>}
              {values.constraints?.memoryLimit && <li>Memory limit: {values.constraints.memoryLimit}MB</li>}
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

export default LivePreview;
