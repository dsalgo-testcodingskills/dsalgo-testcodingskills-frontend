import React, { useState, useEffect } from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import { getCustomQuestions } from '../../Services/api';
import { useHistory } from 'react-router-dom';
import './CustomQuestionList.scss';
import CustomLoadingAnimation from '../../components/CustomLoadingAnimation';
import Pagination from '../../components/Pagination/Pagination';
import { useSelector } from 'react-redux';
import { setCustomQuestionFilter } from '../../Redux/Actions/dataAction';
import { useDispatch } from 'react-redux';
import { Tooltip } from '@material-ui/core';
const CustomQuestionList = () => {
  const history = useHistory();

  const { customQuestionFilter, loginData } = useSelector((store) => {
    return {
      customQuestionFilter: store.dataReducer.customQuestionFilter,
      loginData: store.dataReducer.loginData,
    };
  });
  const [customQuestionList, setCustomQuestionList] = useState([]);
  const [Loading, SetLoading] = useState(false);
  const dispatch = useDispatch();
  const [count, setCount] = useState(0);

  const rowcount = (cell, row, rowindex) => {
    return (
      rowindex +
      (customQuestionFilter.page - 1) * customQuestionFilter.limit +
      1
    );
  };

  const questionFormatter = (cell) => {
    return cell ? cell.charAt(0).toUpperCase() + cell.slice(1) : '';
  };

  const actionColumnView = (cell, row) => {
    return (
      <div className="d-flex justify-content-center flex-row">
        <Tooltip title="Edit" arrow>
          <a
            className="actionIcon mx-2"
            style={
              row.organizationId !== loginData.organisationId &&
              row.public === true
                ? { pointerEvents: 'none', opacity: 0.2 }
                : { pointerEvents: 'all' }
            }
            onClick={() => {
              history.push(`/admin/customQuestionnew/${cell}`);
            }}
          >
            <i className="far fa-edit"></i>
          </a>
        </Tooltip>
      </div>
    );
  };

  const instructionFormat = (cell) => {
    return <span dangerouslySetInnerHTML={{ __html: cell }}></span>;
  };

  const columns = [
    {
      headerClasses: 'tableHeading text-center',
      dataField: '',
      text: 'Serial Number',
      formatter: rowcount,
      style: {
        textAlign: 'center',
        paddingTop: '18px',
      },
    },
    {
      headerClasses: ' tableHeading',
      dataField: 'question',
      formatter: questionFormatter,
      text: 'Question',
      style: {
        paddingTop: '18px',
      },
    },
    {
      headerClasses: ' tableHeading',
      dataField: 'level',
      text: 'Level',
      style: {
        paddingTop: '18px',
      },
    },
    {
      headerClasses: ' tableHeading',
      dataField: 'sampleQuestion',
      text: 'Sample Question',

      style: {
        paddingTop: '18px',
      },
    },
    {
      headerClasses: ' tableHeading',
      dataField: 'instructions',
      text: 'Instructions',
      formatter: instructionFormat,
      style: {
        paddingTop: '18px',
      },
    },
    {
      headerClasses: 'text-center tableHeading',
      dataField: '_id',
      text: 'Actions',
      formatter: actionColumnView,
      style: {
        paddingTop: '12px',
      },
    },
  ];

  const getCustomQuestionData = async () => {
    try {
      SetLoading(true);
      const result = await getCustomQuestions(customQuestionFilter);
      setCustomQuestionList(result?.data?.data);
      setCount(result.data?.count);
    } catch (error) {
      console.log(error);
    } finally {
      SetLoading(false);
    }
  };

  useEffect(() => {
    getCustomQuestionData();
  }, [customQuestionFilter]);

  return (
    <>
      <label className="head">
        <span
          onClick={() => history.push('/admin/testStatus')}
          style={{ cursor: 'pointer' }}
        >
          Dashboard
        </span>
        &nbsp; / &nbsp; Custom Questions
      </label>
      <div className="customQuestionList">
        <div className="row">
          <div className="d-flex justify-content-end">
            <button
              className="btns px-4"
              onClick={() => history.push('/admin/customQuestionnew')}
            >
              Create Question
            </button>
          </div>
        </div>
        <div className="table-responsive">
          {count > 0 ? (
            <BootstrapTable
              classes="mt-4 mb-0"
              keyField="_id"
              data={customQuestionList}
              columns={columns}
            />
          ) : (
            <p className="text-center py-5 fs-4">No Questions</p>
          )}
        </div>
        {count > 10 && (
          <Pagination
            className="pagination-bar"
            currentPage={customQuestionFilter.page}
            totalCount={count}
            pageSize={customQuestionFilter.limit}
            onPageChange={(page) =>
              dispatch(
                setCustomQuestionFilter({
                  ...customQuestionFilter,
                  page: page,
                }),
              )
            }
          />
        )}
      </div>
      <CustomLoadingAnimation isLoading={Loading} />
    </>
  );
};

export default CustomQuestionList;
