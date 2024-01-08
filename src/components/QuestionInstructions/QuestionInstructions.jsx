import React from 'react';
import './QuestionInstructions.scss';
function QuestionInstructions({ question, showInstructions }) {
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
    </>
  );
}

export default QuestionInstructions;
