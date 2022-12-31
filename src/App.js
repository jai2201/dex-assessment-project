import { React, useEffect, useState } from 'react';
import axios from 'axios';
import ContactList from './containers/ContactList';
import SearchBox from './components/SearchBox';
import AddModal from './common/AddModal';

function App() {
  const [contacts, setContacts] = useState([]);
  const [addModalShow, setAddModalShow] = useState(false);

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

  const handleSaveContact = () => {
    console.log(values);
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
