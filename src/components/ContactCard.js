import React from 'react';

const ContactCard = ({ contactDetails }) => {
  return (
    <figure className="bg-white text-white h-100 rounded-lg shadow-md p-auto py-5 mx-2">
      <img
        alt="user"
        className="w-36 h-36 rounded-full mx-auto"
        src={contactDetails['image']}
      />
      <figcaption className="text-center mt-5">
        <p className="text-gray-700 font-semibold text-xl mb-2">
          {contactDetails['name']}
        </p>
        <p className="text-gray-500">
          <span className="font-medium">phone: </span>
          {contactDetails['phone']}
        </p>
        <p className="text-gray-500">
          <span className="font-medium">Last contacted at: </span>
          {contactDetails['last_contacted_at']}
        </p>
      </figcaption>
    </figure>
  );
};
export default ContactCard;
