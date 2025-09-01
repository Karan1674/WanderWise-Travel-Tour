import { useState } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useDispatch } from 'react-redux';

function DeleteModal({ modalId, entityName, entityId, apiEndpoint, deleteCallback }) {

  const [loading, setLoading] = useState(false);


  const dispatch = useDispatch()

  const handleDeleteConfirm = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.get(apiEndpoint, { withCredentials: true });
      const data = response.data;
      if (data.success) {
        dispatch(deleteCallback(entityId));
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(`Error deleting ${entityName}:`, error);
      toast.error(error.response?.data?.message || `Failed to delete ${entityName}`);
    } finally {
      setLoading(false);
      const backdrop = document.querySelector(".modal-backdrop");
      if (backdrop) backdrop.remove();
    }
  };

  return (
    <div
      className='modal fade'
      id={modalId}
      tabIndex="-1"
      role="dialog"
      aria-labelledby={`${modalId}Label`}
      aria-hidden="true"
      style={{ zIndex: 999999, top: '30px', padding: '20px' }}
    >
      <div
        className="modal-dialog modal-dialog-centered"
        role="document"
        style={{ transition: 'all 0.3s ease-in-out' }}
      >
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id={`${modalId}Label`}>
              Confirm Delete
            </h5>
            <button
              type="button"
              className="close"
              data-dismiss="modal"
              aria-label="Close"
              disabled={loading}
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body">
            Are you sure you want to delete this {entityName || 'Item'}?
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              data-dismiss="modal"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={handleDeleteConfirm}
              disabled={loading}
            >
              {loading ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DeleteModal;