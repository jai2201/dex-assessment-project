import { React, useEffect, useState } from 'react';

import ContactList from './containers/ContactList';
import SearchBox from './components/SearchBox';

function App() {
  const [contacts, setContacts] = useState([]);
  return (
    <div className="App">
      <div className={'bg-gray-100 min-h-screen p-20'}>
        <div>
          <p className="text-4xl font-semibold">Contacts</p>
        </div>
        <section>
          <SearchBox />
        </section>
        <section className={'grid sm:grid-cols-2 md:grid-cols-4 gap-6 p-10'}>
          <ContactList contacts={contacts} />
        </section>
      </div>
    </div>
  );
}

export default App;
