import './OutputConstraintsSection.scss';

const ToggleField = ({ label, fieldKey, value, setConstraint, tooltip }) => (
  <div className="ccq-toggle-field">
    <label className="d-flex align-items-center gap-2 mb-0">
      <input
        type="checkbox"
        checked={!!value}
        onChange={() => setConstraint(fieldKey, !value)}
      />
      <span>{label}</span>
      {tooltip && (
        <span title={tooltip} style={{ cursor: 'help' }}>?</span>
      )}
    </label>
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
          Both <code>[0,1]</code> and <code>[1,0]</code> will be accepted as correct answers
        </div>
      )}
      {isFloatOutput && (outputConstraints.tolerance ?? 0) > 0 && (
        <div className="ccq-testcase-hint mt-2">
          Answers within ±{outputConstraints.tolerance} of the expected value will be accepted
        </div>
      )}
    </div>
  );
};

export default OutputConstraintsSection;
