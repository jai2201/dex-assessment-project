import { React, useEffect, useState } from 'react';
import axios from 'axios';
import ContactList from './containers/ContactList';
import SearchBox from './components/SearchBox';

function App() {
  const [contacts, setContacts] = useState([]);

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
          <button className="bg-blue-500 text-white p-2 rounded font-medium">
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
      </div>
    </div>
  );
}

export default App;
