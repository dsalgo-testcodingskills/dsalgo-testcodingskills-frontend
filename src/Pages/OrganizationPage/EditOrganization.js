import React, { useEffect, useState } from 'react';
import { Formik } from 'formik';
import { useHistory } from 'react-router-dom';

import ImgUpload from './ImageUpload';
import './EditOrganization.scss';
import {
  getPresignedURL,
  uploadFileInS3,
  getOrgDetails,
  updateOrganisation,
} from '../../Services/api';
import { getRandomColor, createImageFromInitials } from '../../utils/helper';
import CustomLoadingAnimation from '../../components/CustomLoadingAnimation';
import CustomToast from '../../components/CustomToast/CustomToast';
import { toast } from 'react-toastify';
import { MiniLoader } from '../../components/MiniLoder';

const EditOrganization = () => {
  const history = useHistory();

  const [user, setUser] = useState(null);
  const [Loading, SetLoading] = useState(false);
  const [imgLoad, SetImgLoad] = useState(false);
  const [color, setColor] = useState(null);

  const initialValues = {
    organizationLogo: null,
    organizationName: '',
  };

  const getOrganization = async () => {
    try {
      SetImgLoad(true);
      let resp = await getOrgDetails();
      setUser(resp.data);
    } catch (error) {
      console.log(error);
    } finally {
      SetImgLoad(false);
    }
  };

  const onSubmitForm = async (values) => {
    try {
      SetLoading(true);
      let imgURL = null;
      if (values.organizationLogo !== null) {
        let query = {
          path: `organization/${new Date().getTime()}${
            values.organizationLogo.name
          }`,
          contentType: `${values.organizationLogo.type}`,
        };

        let signedUrlResponse = await getPresignedURL(query);
        imgURL =
          signedUrlResponse.data.url +
          '/' +
          signedUrlResponse.data.fields['key'];

        const formData = new FormData();
        Object.keys(signedUrlResponse.data.fields).forEach((key) => {
          formData.append(key, signedUrlResponse.data.fields[key]);
        });
        formData.append('file', values.organizationLogo);
        await uploadFileInS3(signedUrlResponse.data.url, formData).catch(() => {
          throw new Error('Error while uploading image');
        });
      }
      await updateOrganisation({
        organizationLogo: imgURL,
        organizationName: values?.organizationName,
      });
      getOrganization();
    } catch (error) {
      console.log(error);
    } finally {
      SetLoading(false);
      toast(
        <CustomToast
          type="success"
          message="Organization Details updated successfully"
        />,
      );
    }
  };

  useEffect(() => {
    getOrganization();
    setColor(getRandomColor());
  }, []);

  return (
    <>
      <label className="head">
        <span
          onClick={() => history.push('/admin/testStatus')}
          style={{ cursor: 'pointer' }}
        >
          Dashboard
        </span>{' '}
        / Organization Details
      </label>
      <div className="editOrganization">
        <CustomLoadingAnimation isLoading={Loading} />

        <div
          className="card-title text-left mt-4 card-header-text"
          style={{ color: '#212121' }}
        >
          Organization Details
        </div>
        <div className="card-body">
          <Formik initialValues={initialValues} onSubmit={onSubmitForm}>
            {({ values, handleChange, handleSubmit, setFieldValue }) => (
              <>
                <div className="upload-img-sec">
                  {values.organizationLogo ? (
                    <ImgUpload
                      externalClass={'profile-img'}
                      file={values.organizationLogo}
                      removeFile={() => {
                        setFieldValue('organizationLogo', '');
                      }}
                    ></ImgUpload>
                  ) : (
                    <div className="profile-img">
                      {imgLoad ? (
                        <MiniLoader />
                      ) : (
                        <img
                          loading="lazy"
                          className="w-full h-full object-cover"
                          src={
                            user?.orgDetails?.organizationLogo
                              ? user?.orgDetails?.organizationLogo
                              : createImageFromInitials(
                                  500,
                                  user?.userInfo?.name,
                                  color,
                                )
                          }
                          alt="No Image"
                        />
                      )}
                    </div>
                  )}
                  <div className="editLogo">
                    <label htmlFor="upload">
                      <div className="editLogo--round">
                        <img
                          src="/images/editLogo.svg"
                          className="editLogo_icon"
                        />
                        <input
                          type={'file'}
                          id={'upload'}
                          accept="image/png, image/jpeg, image/jpg"
                          style={{ display: 'none' }}
                          onChange={(e) => {
                            setFieldValue(
                              'organizationLogo',
                              e.target.files[0],
                            );
                          }}
                        />
                      </div>
                    </label>
                  </div>

                  <div className="name-container">
                    <div className="upload-profile">
                      Upload Organization Logo
                    </div>
                  </div>
                </div>
                <div className="Orgnizaion__User">
                  <span>Username:</span> &nbsp; {user?.userInfo?.name}
                </div>
                <form className="editForm">
                  <div className="editForm__name">
                    <label>Organization Name</label>
                  </div>
                  <div className="inputText-wrapper">
                    <div className="inputText">
                      <input
                        type="text"
                        placeholder={user?.orgDetails?.name}
                        value={values.name}
                        onChange={handleChange('organizationName')}
                      />
                    </div>
                  </div>
                  <div className="d-flex ">
                    <button
                      className=" btns mb-2 mb-lg-0"
                      onClick={handleSubmit}
                    >
                      <span>Save Profile Details</span>
                    </button>
                  </div>
                </form>
              </>
            )}
          </Formik>
        </div>
      </div>
    </>
  );
};

export default EditOrganization;
