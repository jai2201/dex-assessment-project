import { React, useEffect, useState } from 'react';
import axios from 'axios';
import S3FileUpload from 'react-s3';
import ContactList from './containers/ContactList';
import SearchBox from './components/SearchBox';
import AddModal from './common/AddModal';
window.Buffer = window.Buffer || require('buffer').Buffer;

const S3_BUCKET = 'dex-assessment-contact-images';
const REGION = 'ap-south-1';
const ACCESS_KEY = 'AKIAUTLN6U54YCE4MJYH';
const SECRET_ACCESS_KEY = '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';

function App() {
  const [contacts, setContacts] = useState([]);
  const [addModalShow, setAddModalShow] = useState(false);
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
      console.log('request received');
      const imageS3URL = await handleUpload(values.image);
      console.log('uploading data to db now', imageS3URL);
      const response = axios
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
    } catch (error) {
      console.log(error);
    }
  };

  const handleUpload = async (file) => {
    console.log('request received for uploading file');
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
          <ContactList contacts={contacts} />
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
      </div>
    </div>
  );
}

export default App;
