import { React, useEffect, useState } from 'react';

import axios from 'axios';
import S3FileUpload from 'react-s3';
import ContactCard from './components/ContactCard';
import SearchBox from './components/SearchBox';
import AddModal from './common/AddModal';
import EditModal from './common/EditModal';
window.Buffer = window.Buffer || require('buffer').Buffer;

const S3_BUCKET = process.env.REACT_APP_S3_BUCKET;
const REGION = process.env.REACT_APP_S3_REGION;
const ACCESS_KEY = process.env.REACT_APP_AWS_SECRET_KEY;
const SECRET_ACCESS_KEY = process.env.REACT_APP_AWS_ACCESS_SECRET_KEY;

function App() {
  const [contacts, setContacts] = useState([]);
  const [addModalShow, setAddModalShow] = useState(false);
  const [editModalShow, setEditModalShow] = useState(false);

  const config = {
    bucketName: S3_BUCKET,
    region: REGION,
    accessKeyId: ACCESS_KEY,
    secretAccessKey: SECRET_ACCESS_KEY,
  };

  const [values, setValues] = useState({
    name: '',
    image: null,
    phone: '',
    lastContactDate: '',
    uploadedImageUrl: '',
  });

  const handleChange = (name) => (event) => {
    if (name === 'image') {
      setValues({ ...values, [name]: event.target.files[0] });
    } else {
      setValues({ ...values, [name]: event.target.value });
    }
  };

  const handleSaveContact = async () => {
    try {
      const imageS3URL = await handleImageUploadToS3(values.image);
      axios
        .post(
          `https://14jpf5t9kc.execute-api.ap-south-1.amazonaws.com/prod/contacts`,
          {
            id: (Math.random() + 1).toString(36).substring(7),
            name: values.name,
            image: imageS3URL,
            phone: values.phone,
            last_contacted_at: values.lastContactDate,
          }
        )
        .then((res) => {
          console.log(res);
        })
        .catch((err) => {
          console.log(err);
        });
      getContacts();
      setAddModalShow(false);
      setValues({
        name: '',
        image: null,
        phone: '',
        lastContactDate: '',
        uploadedImageUrl: '',
      });
    } catch (error) {
      console.log(error);
    }
  };

  const handleUpdateContact = async () => {
    try {
      let body = {};
      if (values.image != null) {
        const imageS3URL = await handleImageUploadToS3(values.image);
        body = {
          name: values.name,
          image: imageS3URL,
          phone: values.phone,
          last_contacted_at: values.lastContactDate,
        };
      } else {
        body = {
          name: values.name,
          phone: values.phone,
          last_contacted_at: values.lastContactDate,
        };
      }
      axios
        .put(
          `https://14jpf5t9kc.execute-api.ap-south-1.amazonaws.com/prod/contacts/${values.id}`,
          body
        )
        .then((res) => {
          console.log(res);
          setEditModalShow(false);
          setValues({
            name: '',
            image: null,
            phone: '',
            lastContactDate: '',
            uploadedImageUrl: '',
          });
        })
        .catch((err) => {
          console.log(err);
        });
      getContacts();
    } catch (error) {
      console.log(error);
    }
  };

  const handleImageUploadToS3 = async (file) => {
    try {
      const uploadedImage = await S3FileUpload.uploadFile(file, config);
      return uploadedImage.location;
    } catch (error) {
      console.log(error);
    }
  };

  const getContacts = async () => {
    try {
      const response = await axios.get(
        `https://14jpf5t9kc.execute-api.ap-south-1.amazonaws.com/prod/contacts`
      );
      setContacts(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getContacts();
  }, [contacts]);

  return (
    <div className="App">
      <div className={'bg-gray-100 min-h-screen p-20'}>
        <div className="flex justify-between my-auto">
          <p className="text-4xl font-semibold">Contacts</p>
          <SearchBox />
          <button
            className="bg-blue-500 text-white p-2 rounded font-medium"
            onClick={() => {
              setAddModalShow(true);
              setValues({
                name: '',
                image: null,
                phone: '',
                lastContactDate: '',
                uploadedImageUrl: '',
              });
            }}
          >
            + Add Contact
          </button>
        </div>
        <div
          className={
            'grid sm:grid-cols-2 md:grid-cols-4 gap-6 p-10 first:pl-0 last:pl-0'
          }
        >
          {contacts.map((each_contact) => {
            return (
              <div
                key={each_contact['id']}
                onClick={() => {
                  setValues({
                    id: each_contact['id'],
                    name: each_contact['name'],
                    uploadedImageUrl: each_contact['image'],
                    image: null,
                    phone: each_contact['phone'],
                    lastContactDate: each_contact['last_contacted_at'],
                  });
                  setEditModalShow(true);
                }}
              >
                <ContactCard contactDetails={each_contact} />
              </div>
            );
          })}
        </div>
        <AddModal
          addModalShow={addModalShow}
          setAddModalShow={setAddModalShow}
          title="Create a New Contact"
        >
          <p>Contact Name</p>
          <input
            type="text"
            required
            className="border"
            value={values.name}
            onChange={handleChange('name')}
          />
          <p>Image</p>
          <input type="file" required onChange={handleChange('image')} />
          <p>Phone</p>
          <input
            type="text"
            required
            className="border"
            value={values.phone}
            onChange={handleChange('phone')}
          />
          <p>Last Contact Date</p>
          <input
            type="date"
            required
            value={values.lastContactDate}
            onChange={handleChange('lastContactDate')}
          />
          <br />
          <button
            className="bg-blue-500 text-white p-2 rounded font-medium"
            onClick={handleSaveContact}
          >
            Save Contact
          </button>
        </AddModal>
        <EditModal
          editModalShow={editModalShow}
          setEditModalShow={setEditModalShow}
          title="Update Contact"
        >
          <p>Contact Name</p>
          <input
            type="text"
            required
            className="border"
            value={values.name}
            onChange={handleChange('name')}
          />
          <p>Upload new Image</p>
          <img src={values.uploadedImageUrl} />
          <input type="file" required onChange={handleChange('image')} />
          <p>Phone</p>
          <input
            type="text"
            required
            className="border"
            value={values.phone}
            onChange={handleChange('phone')}
          />
          <p>Last Contact Date</p>
          <input
            type="date"
            required
            value={values.lastContactDate}
            onChange={handleChange('lastContactDate')}
          />
          <br />
          <button
            className="bg-blue-500 text-white p-2 rounded font-medium"
            onClick={handleUpdateContact}
          >
            Update Contact
          </button>
        </EditModal>
      </div>
    </div>
  );
}

export default App;
