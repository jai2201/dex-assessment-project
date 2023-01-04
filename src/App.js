import { React, useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import S3FileUpload from 'react-s3';
import ContactCard from './components/ContactCard';
import SearchBox from './components/SearchBox';
import AddModal from './common/AddModal';
import EditModal from './common/EditModal';

window.Buffer = window.Buffer || require('buffer').Buffer;
const root = window.document.documentElement;
const switchTheme = () => {
  if (localStorage.getItem('theme') === 'dark') {
    root.classList.remove('dark');
    root.classList.add('light');
    localStorage.setItem('theme', 'light');
  } else {
    root.classList.remove('light');
    root.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  }
};

const S3_BUCKET = process.env.REACT_APP_S3_BUCKET;
const REGION = process.env.REACT_APP_S3_REGION;
const ACCESS_KEY = process.env.REACT_APP_AWS_SECRET_KEY;
const SECRET_ACCESS_KEY = process.env.REACT_APP_AWS_ACCESS_SECRET_KEY;

function App() {
  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [addModalShow, setAddModalShow] = useState(false);
  const [editModalShow, setEditModalShow] = useState(false);
  const [filterQuery, setFilterQuery] = useState('');
  const [values, setValues] = useState({
    name: '',
    image: null,
    phone: '',
    lastContactDate: '',
    uploadedImageUrl: '',
  });

  const config = {
    bucketName: S3_BUCKET,
    region: REGION,
    accessKeyId: ACCESS_KEY,
    secretAccessKey: SECRET_ACCESS_KEY,
  };

  const handleChange = (name) => (event) => {
    if (name === 'image') {
      setValues({ ...values, [name]: event.target.files[0] });
    } else {
      setValues({ ...values, [name]: event.target.value });
    }
  };

  const resetState = () => {
    setValues({
      name: '',
      image: null,
      phone: '',
      lastContactDate: '',
      uploadedImageUrl: '',
    });
  };

  const handleImageUploadToS3 = async (file) => {
    try {
      const uploadedImage = await S3FileUpload.uploadFile(file, config);
      return uploadedImage.location;
    } catch (error) {
      toast.error(`Error while uploading image to s3 - ${error}`);
      console.log(error);
    }
  };

  const handleSaveContact = async (event) => {
    event.preventDefault();
    try {
      const imageS3URL = await handleImageUploadToS3(values.image);
      await axios.post(
        `https://14jpf5t9kc.execute-api.ap-south-1.amazonaws.com/prod/contacts`,
        {
          id: (Math.random() + 1).toString(36).substring(7),
          name: values.name.replace(/\s+/g, ' ').trim(),
          image: imageS3URL,
          phone: values.phone.replace(/\s+/g, ' ').trim(),
          last_contacted_at: values.lastContactDate,
        }
      );
      getContacts();
      setAddModalShow(false);
      resetState();
      toast.success('Contact saved successfully.');
    } catch (error) {
      if (error.response.data.message) {
        toast.error(
          `Error while saving contact - ${error.response.data.message}`
        );
      } else {
        toast.error(`Error while saving contact - ${error.message}`);
      }
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
          name: values.name.replace(/\s+/g, ' ').trim(),
          image: imageS3URL,
          phone: values.phone.replace(/\s+/g, ' ').trim(),
          last_contacted_at: values.lastContactDate,
        };
      } else {
        body = {
          name: values.name.replace(/\s+/g, ' ').trim(),
          phone: values.phone.replace(/\s+/g, ' ').trim(),
          last_contacted_at: values.lastContactDate,
        };
      }
      await axios.put(
        `https://14jpf5t9kc.execute-api.ap-south-1.amazonaws.com/prod/contacts` +
          `/${values.id}`,
        body
      );
      setEditModalShow(false);
      resetState();
      getContacts();
      toast.success('Contact updated successfully.');
    } catch (error) {
      if (error.response.data.message) {
        toast.error(
          `Error while saving contact - ${error.response.data.message}`
        );
      } else {
        toast.error(`Error while saving contact - ${error.message}`);
      }
      console.log(error);
    }
  };

  const handleDeleteContact = async (event) => {
    event.preventDefault();
    try {
      await axios.delete(
        `https://14jpf5t9kc.execute-api.ap-south-1.amazonaws.com/prod/contacts` +
          `/${values.id}`
      );
      setEditModalShow(false);
      resetState();
      getContacts();
      toast.success('Contact deleted successfully.');
    } catch (error) {
      toast.error(`Error while deleting contact - ${error}`);
      console.log(error);
    }
  };

  const getContacts = async () => {
    try {
      const response = await axios.get(
        `https://14jpf5t9kc.execute-api.ap-south-1.amazonaws.com/prod/contacts`
      );
      setContacts(response.data);
      setFilteredContacts(response.data);
    } catch (error) {
      toast.error(`Error while fetching contacts - ${error}`);
      console.log(error);
    }
  };

  const applyFilter = () => {
    if (!filterQuery) {
      setFilteredContacts(contacts);
    } else {
      const queryString = filterQuery.toLowerCase();
      const filteredData = contacts.filter((contact) => {
        const name = `${contact.name}`;

        // if it's just one letter, return all names that start with it
        if (queryString.length === 1) {
          const firstLetter = name.charAt(0).toLowerCase();
          return firstLetter === queryString;
        } else {
          return name.toLowerCase().startsWith(queryString);
        }
      });
      setFilteredContacts(filteredData);
    }
  };

  useEffect(() => {
    getContacts();
  }, []);

  useEffect(() => {
    applyFilter();
  }, [filterQuery]);

  useEffect(() => {
    if (
      !localStorage.getItem('theme') ||
      localStorage.getItem('theme') === ''
    ) {
      localStorage.setItem('theme', 'light');
      root.classList.remove('dark');
      root.classList.add('light');
    } else {
      switchTheme();
    }
  }, []);

  return (
    <div className="App transition-all duration-200">
      <ToastContainer />
      <div className="bg-gray-100 min-h-screen p-20 dark:bg-black">
        <div className="flex flex-row justify-between my-auto">
          <p className="text-4xl font-semibold dark:text-white">Contacts</p>
          <SearchBox setFilterQuery={setFilterQuery} />
          <button
            className="bg-blue-500 dark:hover:text-black text-white p-2 rounded font-medium focus:outline-none dark:bg-black dark:border dark:border-white"
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
          <input
            type="checkbox"
            onChange={switchTheme}
            defaultChecked={localStorage.getItem('theme') === 'dark'}
          />
        </div>
        <div
          className={
            'grid sm:grid-cols-2 md:grid-cols-4 gap-6 p-10 first:pl-0 last:pl-0'
          }
        >
          {filteredContacts?.length < 1 && (
            <h1 className="dark:text-white">No data matches your search</h1>
          )}
          {filteredContacts.map((each_contact) => {
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
                className="cursor-pointer hover:scale-110 transition duration-300 ease-in-out"
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
              maxLength="28"
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
              accept="image/*"
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
              pattern="[0-9]+"
              maxLength="15"
            />
            <span>*(please only enter numbers between 0-9)</span>
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
              maxLength="28"
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
              accept="image/*"
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
              pattern="[0-9]+"
              maxLength="15"
            />
            <span>*(please only enter numbers between 0-9)</span>
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
