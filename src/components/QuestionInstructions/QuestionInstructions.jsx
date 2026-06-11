import React from 'react';
import './QuestionInstructions.scss';

const formatConstraints = (inputType) => {
  if (!inputType || !Array.isArray(inputType)) return [];
  const allRules = [];
  inputType.forEach((param) => {
    const rules = [];
    const c = param.constraints || {};
    const name = param.paramName || 'input';

    if (c.minSize !== undefined || c.maxSize !== undefined) {
      rules.push(`${c.minSize ?? 1} <= ${name}.length <= ${c.maxSize ?? '10^4'}`);
    }
    if (c.minRows !== undefined || c.maxRows !== undefined) {
      rules.push(`${c.minRows ?? 1} <= ${name}.rows <= ${c.maxRows ?? '100'}`);
    }
    if (c.minCols !== undefined || c.maxCols !== undefined) {
      rules.push(`${c.minCols ?? 1} <= ${name}.cols <= ${c.maxCols ?? '100'}`);
    }
    if (c.minValue !== undefined || c.maxValue !== undefined) {
      rules.push(`${c.minValue ?? '-10^9'} <= ${name} <= ${c.maxValue ?? '10^9'}`);
    }
    if (c.minElement !== undefined || c.maxElement !== undefined) {
      rules.push(`${c.minElement ?? '-10^9'} <= ${name}[i] <= ${c.maxElement ?? '10^9'}`);
    }
    if (c.minLength !== undefined || c.maxLength !== undefined) {
      rules.push(`${c.minLength ?? 1} <= ${name}.length <= ${c.maxLength ?? '1000'}`);
    }
    if (c.isSorted) rules.push(`${name} must be sorted (${c.sortOrder || 'asc'})`);
    if (c.isUnique) rules.push(`${name} must contain unique elements`);
    if (c.isSquare) rules.push(`${name} must be a square matrix`);
    if (c.isPalindrome) rules.push(`${name} must be a palindrome`);
    if (c.isPositiveOnly) rules.push(`${name} must contain positive values only`);
    
    if (rules.length > 0) {
      allRules.push(...rules);
    }
  });
  return allRules;
};

function QuestionInstructions({ question, showInstructions }) {
  const constraints = formatConstraints(question?.inputType);

  return (
    <>
      {showInstructions && (
        <div className="form-group ">
          <h5 style={{ fontSize: '21px', color: '#EF8031' }}>Notes</h5>
          <div className="questionInstruction">
            <p>1. Please write your solution into the provided Function</p>
            <p>2. Changing language while coding will revert all your code.</p>
            <p>
              3. Once you click on {'"Submit"'} that question will be disabled
              for editing.
            </p>
            <p>
              4. You can {'"Submit"'} the question even if test cases are
              failed.
            </p>
            <p>5. Press Ctrl+Enter to run your code while in editor.</p>
            <p>6. Do not use inbuilt functions.</p>
            <p>7. Do not import any packages.</p>
          </div>
        </div>
      )}
      <div>
        <h5 style={{ fontSize: '21px', color: '#212121' }}>Question</h5>
        <div className="questionInstruction__question">
          {' '}
          <p
            className="form-group mt-2"
            dangerouslySetInnerHTML={{ __html: question?.question }}
          ></p>
        </div>
      </div>
      <div className="mt-3">
        <h5 className="" style={{ fontSize: '21px', color: '#212121' }}>
          Instructions
        </h5>
        <div
          className="questionInstruction__question"
          style={{ padding: '20px' }}
        >
          <p
            className="form-group mt-2"
            dangerouslySetInnerHTML={{ __html: question?.instructions }}
          ></p>
        </div>
      </div>

      {constraints.length > 0 && (
        <div className="mt-3">
          <h5 style={{ fontSize: '21px', color: '#212121' }}>Constraints</h5>
          <div className="questionInstruction__question" style={{ padding: '15px 20px' }}>
            <ul className="mb-0">
              {constraints.map((rule, idx) => (
                <li key={idx} className="mt-1" style={{ fontSize: '14px', color: '#444' }}>
                  <code>{rule}</code>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}

export default QuestionInstructions;
