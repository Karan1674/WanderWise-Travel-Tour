import { useNavigate, useLocation } from 'react-router-dom';


function Pagination({ currentPage, totalPages, search, statusFilter }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handlePageChange = (page) => {
    const newUrl = `?page=${page}${search ? `&search=${encodeURIComponent(search)}` : ''}${statusFilter !== 'all' ? `&statusFilter=${encodeURIComponent(statusFilter)}` : ''}`;
    navigate(`${location.pathname}${newUrl}`);
  };

  const maxPagesToShow = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
  let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
  if (endPage - startPage < maxPagesToShow - 1) {
    startPage = Math.max(1, endPage - maxPagesToShow + 1);
  }

  const pages = [];
  for (let i = startPage; i <= endPage; i++) {
    pages.push(
      <li key={i} className={`page-item ${i === currentPage ? 'active' : ''}`}>
        <button className="page-link" onClick={() => handlePageChange(i)}>
          {i}
        </button>
      </li>
    );
  }

  return (
    <div className="pagination-wrap">
      <nav className="pagination-inner">
        <ul className={`pagination ${currentPage === 1 ? 'disabled' : ''}`}>
          <li className="page-item">
            {currentPage === 1 ? (
              <span className="page-link">
                <i className="fas fa-chevron-left"></i>
              </span>
            ) : (
              <button className="page-link" onClick={() => handlePageChange(currentPage - 1)}>
                <i className="fas fa-chevron-left"></i>
              </button>
            )}
          </li>
          {pages}
          <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
            {currentPage === totalPages ? (
              <span className="page-link">
                <i className="fas fa-chevron-right"></i>
              </span>
            ) : (
              <button className="page-link" onClick={() => handlePageChange(currentPage + 1)}>
                <i className="fas fa-chevron-right"></i>
              </button>
            )}
          </li>
        </ul>
      </nav>
    </div>
  );
}

export default Pagination;
