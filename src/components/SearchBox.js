const SearchBox = () => {
  return (
    <form className="my-auto">
      <input
        type={'text'}
        placeholder={'Type here to search contacts...'}
        className={'rounded-md p-2 w-96'}
      />
    </form>
  );
};

export default SearchBox;
