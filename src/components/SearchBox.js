const SearchBox = () => {
  return (
    <form className="my-auto">
      <input
        type={'text'}
        placeholder={'type here to search...'}
        className={'rounded-md p-2 w-96'}
      />
    </form>
  );
};

export default SearchBox;
