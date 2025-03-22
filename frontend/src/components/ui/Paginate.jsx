// src/components/ui/Paginate.jsx
import React from 'react';
import ReactPaginate from 'react-paginate';

const Paginate = ({
  pageCount,
  onPageChange,
  previousLabel = 'Înapoi',
  nextLabel = 'Înainte',
  containerClassName = 'flex justify-center items-center mt-8 space-x-2',
  pageLinkClassName = 'px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition duration-300',
  previousLinkClassName = 'px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition duration-300',
  nextLinkClassName = 'px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition duration-300',
  activeLinkClassName = 'bg-blue-600 text-white border-2 border-blue-500',
  disabledLinkClassName = 'opacity-50 cursor-not-allowed',
}) => {
  return (
    <ReactPaginate
      previousLabel={previousLabel}
      nextLabel={nextLabel}
      pageCount={pageCount}
      onPageChange={onPageChange}
      containerClassName={containerClassName}
      previousLinkClassName={previousLinkClassName}
      nextLinkClassName={nextLinkClassName}
      pageLinkClassName={pageLinkClassName}
      activeLinkClassName={activeLinkClassName}
      disabledLinkClassName={disabledLinkClassName}
      breakLabel="..."
      breakClassName="px-4 py-2 text-gray-400"
      breakLinkClassName="px-4 py-2 text-gray-400"
      pageRangeDisplayed={3}
      marginPagesDisplayed={1}
      renderOnZeroPageCount={null}
      // Accessibility improvements
      previousAriaLabel="Previous page"
      nextAriaLabel="Next page"
      pageAriaLabel={(page) => `Page ${page}`}
    />
  );
};

export default Paginate;