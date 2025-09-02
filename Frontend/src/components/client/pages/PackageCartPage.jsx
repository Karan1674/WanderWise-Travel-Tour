import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import Loader from '../layouts/Loader';


function PackageCartPage() {
  const { user, userType } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(true);
  const [quantities, setQuantities] = useState({});

  useEffect(() => {
    const fetchCart = async () => {
      try {
        if (!user || userType !== 'User') {
          toast.error('Unauthorized access');
          navigate('/login');
          return;
        }

        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/client/packageCart`, {
          withCredentials: true,
        });

        if (response.data.success) {
          setCart(response.data.cart || { items: [] });
          setQuantities(
            response.data.cart.items.reduce((acc, item) => ({
              ...acc,
              [item.packageId._id]: item.quantity,
            }), {})
          );
        } else {
          toast.error(response.data.message || 'Failed to load cart');
        }
      } catch (error) {
        console.error('Error fetching cart:', error);
        toast.error(error.response?.data?.message || 'Server error');
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [navigate, user, userType]);

  const updateCart = async (packageId, quantity) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/client/packageCart/update`,
        { packageId, quantity },
        { withCredentials: true }
      );
      if (response.data.success) {
        setQuantities((prev) => ({ ...prev, [packageId]: quantity }));
        setCart((prev) => ({
          ...prev,
          items: prev.items.map((item) =>
            item.packageId._id === packageId ? { ...item, quantity } : item
          ),
        }));
        toast.success('Cart updated');
      } else {
        toast.error(response.data.message || 'Failed to update cart');
      }
    } catch (error) {
      console.error('Error updating cart:', error);
      toast.error('Error updating cart');
    }
  };

  const removeFromCart = async (packageId) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/client/packageCart/remove`,
        { packageId },
        { withCredentials: true }
      );
      if (response.data.success) {
        setCart((prev) => ({
          ...prev,
          items: prev.items.filter((item) => item.packageId._id !== packageId),
        }));
        toast.success('Item removed from cart');
      } else {
        toast.error(response.data.message || 'Failed to remove item');
      }
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error('Error removing item');
    }
  };

  const calculateTotals = () => {
    const subtotal = cart.items.reduce(
      (sum, item) => sum + (quantities[item.packageId._id] || item.quantity) * (item.packageId.salePrice || item.packageId.regularPrice),
      0
    );
    const vat = subtotal * 0.13;
    const grandTotal = subtotal + vat;
    return { subtotal, vat, grandTotal };
  };

  const { subtotal, vat, grandTotal } = calculateTotals();

  if (loading) {
    return <Loader />;
  }

  return (
 <>
        <section className="inner-banner-wrap">
          <div className="inner-baner-container" style={{ backgroundImage: 'url(/assets/images/inner-banner.jpg)' }}>
            <div className="container">
              <div className="inner-banner-content">
                <h1 className="inner-title">Package Cart</h1>
              </div>
            </div>
          </div>
          <div className="inner-shape"></div>
        </section>
        <div className="step-section cart-section">
          <div className="container">
            <div className="step-link-wrap">
              <div className="step-item active">
                Your cart
                <a href="#" className="step-icon"></a>
              </div>
              <div className="step-item">
                Your Details
                <a href="#" className="step-icon"></a>
              </div>
              <div className="step-item">
                Finish
                <a href="#" className="step-icon"></a>
              </div>
            </div>
            <div className="cart-list-inner">
              <form id="cart-form">
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th></th>
                        <th>Product Name</th>
                        <th>Price</th>
                        <th>Quantity</th>
                        <th>Sub Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cart.items.length > 0 ? (
                        cart.items.map((item) => (
                          <tr key={item.packageId._id} data-package-id={item.packageId._id}>
                            <td>
                              <button
                                className="close cart-remove"
                                data-dismiss="alert"
                                aria-label="Close"
                                onClick={() => removeFromCart(item.packageId._id)}
                              >
                                <span aria-hidden="true">×</span>
                              </button>
                              <span className="cartImage">
                                <img
                                  src={`${import.meta.env.VITE_API_URL}/Uploads/gallery/${item.packageId.featuredImage || 'default.jpg'}`}
                                  alt="image"
                                />
                              </span>
                            </td>
                            <td data-column="Product Name">{item.packageId.title}</td>
                            <td
                              data-column="Price"
                              data-price={item.packageId.salePrice || item.packageId.regularPrice}
                            >
                              ${(item.packageId.salePrice || item.packageId.regularPrice).toFixed(2)}
                            </td>
                            <td data-column="Quantity" className="count-input">
                              <div style={{ display: 'flex', alignItems: 'center' }}>
                                <a
                                  className="minus-btn cart-quantity-btn"
                                  href="#"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    const newQuantity = Math.max(1, (quantities[item.packageId._id] || item.quantity) - 1);
                                    updateCart(item.packageId._id, newQuantity);
                                  }}
                                >
                                  <i className="fa fa-minus"></i>
                                </a>
                                <input
                                  className="quantity"
                                  type="text"
                                  value={quantities[item.packageId._id] || item.quantity}
                                  readOnly
                                />
                                <a
                                  className="plus-btn cart-quantity-btn"
                                  href="#"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    const newQuantity = (quantities[item.packageId._id] || item.quantity) + 1;
                                    updateCart(item.packageId._id, newQuantity);
                                  }}
                                >
                                  <i className="fa fa-plus"></i>
                                </a>
                              </div>
                            </td>
                            <td data-column="Sub Total" className="sub-total">
                              ${((quantities[item.packageId._id] || item.quantity) * (item.packageId.salePrice || item.packageId.regularPrice)).toFixed(2)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="text-center">
                            Your cart is empty. <Link to="/tour-packages">Continue shopping</Link>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="totalAmountArea">
                  <ul className="list-unstyled" style={{listStyle:'none'}}>
                    <li><strong>Sub Total</strong> <span className="sub-total-amount">${subtotal.toFixed(2)}</span></li>
                    <li><strong>Vat</strong> <span className="vat-amount">${vat.toFixed(2)}</span></li>
                    <li><strong>Grand Total</strong> <span className="grand-total">${grandTotal.toFixed(2)}</span></li>
                  </ul>
                </div>
                <div className="checkBtnArea text-right">
                  <Link to="/packageCart/checkout" className="button-primary">
                    Checkout
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
</>
  );
}

export default PackageCartPage;
