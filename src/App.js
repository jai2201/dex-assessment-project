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

  const handleSaveContact = async (event) => {
    event.preventDefault();
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

  const handleUpdateContact = async (event) => {
    event.preventDefault();
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

  const handleDeleteContact = async (event) => {
    event.preventDefault();
    try {
      axios
        .delete(
          `https://14jpf5t9kc.execute-api.ap-south-1.amazonaws.com/prod/contacts/${values.id}`
        )
        .then((res) => {
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
            className="bg-blue-500 text-white p-2 rounded font-medium focus:outline-none"
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
          <form onSubmit={handleSaveContact}>
            <span className="text-xl">Name : </span>
            <input
              type="text"
              required
              className="border rounded p-1 text-lg ml-2 focus:outline-none pl-1"
              value={values.name}
              onChange={handleChange('name')}
            />
            <br />
            <br />
            <span className="text-xl">Image : </span>
            <input
              type="file"
              className="ml-2"
              required
              onChange={handleChange('image')}
            />
            <br />
            <br />
            <span className="text-xl">Phone : </span>
            <input
              type="text"
              required
              className="border rounded p-1 text-lg ml-2 focus:outline-none pl-1"
              value={values.phone}
              onChange={handleChange('phone')}
            />
            <br />
            <br />
            <span className="text-xl">Last Contact Date : </span>
            <input
              type="date"
              required
              value={values.lastContactDate}
              onChange={handleChange('lastContactDate')}
              className="ml-2 text-lg border rounded p-1"
            />
            <br />
            <br />
            <button className="bg-green-500 text-white p-2 rounded font-medium">
              Save Contact
            </button>
          </form>
        </AddModal>
        <EditModal
          editModalShow={editModalShow}
          setEditModalShow={setEditModalShow}
          title="Update Contact"
        >
          <form onSubmit={handleUpdateContact}>
            <span className="text-xl">Name : </span>
            <input
              type="text"
              required
              className="border rounded p-1 text-lg ml-2 focus:outline-none pl-1"
              value={values.name}
              onChange={handleChange('name')}
            />
            <br />
            <br />
            <div className="flex m-auto">
              <span className="my-auto text-xl mr-2">Uploaded Image : </span>
              <img
                src={values.uploadedImageUrl}
                className="w-36 h-36 rounded-full my-auto"
                alt="contact"
              />
            </div>
            <br />
            <br />
            <span className="text-xl">Upload new image : </span>
            <input
              type="file"
              className="ml-2"
              onChange={handleChange('image')}
            />
            <br />
            <br />
            <span className="text-xl">Phone : </span>
            <input
              type="text"
              required
              className="border rounded p-1 text-lg ml-2 focus:outline-none pl-1"
              value={values.phone}
              onChange={handleChange('phone')}
            />
            <br />
            <br />
            <span className="text-xl">Last contact date : </span>
            <input
              type="date"
              required
              value={values.lastContactDate}
              onChange={handleChange('lastContactDate')}
              className="ml-2 text-lg border rounded p-1"
            />
            <br />
            <br />
            <button className="bg-yellow-500 text-white p-2 rounded font-medium focus:outline-none">
              Update Contact
            </button>
            <button
              className="bg-red-500 text-white p-2 rounded font-medium ml-4 focus:outline-none"
              onClick={handleDeleteContact}
            >
              Delete Contact
            </button>
          </form>
        </EditModal>
      </div>
    </div>
  );
}

export default App;
