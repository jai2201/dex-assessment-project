import React from 'react';

import ContactCard from '../components/ContactCard';

const ContactList = ({ contacts }) => {
  return contacts.map((each_contact) => {
    return (
      <div key={each_contact['id']}>
        <ContactCard contactDetails={each_contact} />
      </div>
    );
  });
};

export default ContactList;
