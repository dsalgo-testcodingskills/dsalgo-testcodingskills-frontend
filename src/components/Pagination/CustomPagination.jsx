import React from 'react';
import './CustomPagination.scss';

function CustomPagination({ filters, totalItems, handlePagination }) {
  return (
    <nav aria-label="Page navigation example">
      <ul className="pagination justify-content-end">
        <li className="page-item">
          <button
            className="page-link rounded"
            disabled={filters.page <= 1}
            onClick={() => {
              handlePagination(filters.page - 1);
            }}
          >
            <i className="fas fa-chevron-left"></i>
          </button>
        </li>
        <li className="page-item">
          <button
            className="page-link rounded"
            hidden={filters.page <= 2}
            onClick={() => {
              handlePagination(filters.page - 2);
            }}
          >
            {filters.page - 2}
          </button>
        </li>
        <li className="page-item">
          <button
            className="page-link rounded"
            hidden={filters.page <= 1}
            onClick={() => {
              handlePagination(filters.page - 1);
            }}
          >
            {filters.page - 1}
          </button>
        </li>
        <li className="page-item">
          <button
            className="page-link page-link-active rounded"
            onClick={() => {
              handlePagination(filters.page);
            }}
          >
            {filters.page}
          </button>
        </li>
        <li className="page-item">
          <button
            className="page-link  rounded"
            hidden={filters.page * filters.limit >= totalItems}
            onClick={() => {
              handlePagination(filters.page + 1);
            }}
          >
            {filters.page + 1}
          </button>
        </li>
        <li className="page-item">
          <button
            className="page-link rounded"
            hidden={parseInt(totalItems / filters.limit) + 1 - filters.page <= 2}
            onClick={() => {
              handlePagination(filters.page + 2);
            }}
          >
            {filters.page + 2}
          </button>
        </li>
        <li> &nbsp; ... &nbsp;</li>
        <li className="page-item">
          <button
            className="page-link page-link rounded"
            onClick={() => {
              handlePagination(Math.ceil(totalItems / 10));
            }}
          >
            {Math.ceil(totalItems / 10)}
          </button>
        </li>
        <li className="page-item">
          <button
            className="page-link rounded"
            hidden={parseInt(totalItems / filters.limit) + 1 - filters.page < 1}
            onClick={() => {
              handlePagination(filters.page + 1);
            }}
          >
            <i className="fas fa-chevron-right"></i>
          </button>
        </li>
      </ul>
    </nav>
  );
}

export default CustomPagination;
