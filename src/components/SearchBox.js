import React from 'react';

const SearchBox = ({ setFilterQuery }) => {
  return (
    <form className="my-auto">
      <input
        type={'text'}
        placeholder={'Type here to search contacts...'}
        className={'rounded-md p-2 w-96'}
        onChange={(event) => setFilterQuery(event.target.value)}
      />
    </form>
  );
};

export default SearchBox;
