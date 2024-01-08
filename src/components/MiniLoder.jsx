import React from 'react';

export const MiniLoader = () => {
  return (
    <div className="text-center py-1">
      <div
        className="spinner-border"
        style={{ textColor: 'Black' }}
        role="status"
      >
        <span className="sr-only">Loading</span>
      </div>
    </div>
  );
};
