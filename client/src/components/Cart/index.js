import React, { useEffect } from 'react';
import CartItem from '../CartItem';
import Auth from '../../utils/auth';
import './style.css';
import { useLazyQuery } from '@apollo/react-hooks';
// import { useStoreContext } from '../../utils/GlobalState';
import { TOGGLE_CART, ADD_MULTIPLE_TO_CART } from '../../utils/store/actions';
import { idbPromise } from "../../utils/helpers";
import { QUERY_CHECKOUT } from '../../utils/queries';
import { loadStripe } from '@stripe/stripe-js';
//useslector = state
import { useDispatch, useSelector } from 'react-redux'

//use to perform checkout redirect
const stripePromise = loadStripe('pk_test_TYooMQauvdEDq54NiTphI7jx');
//pass to connect
  const Cart = () => {
    const dispatch = useDispatch();
    //initialState from store => newState
    const state = useSelector(state => state);

  //use useStoreContext cutom Hook to establish a state variable and the dispatch function to update the state.
  //dispatch will call the toggle cart action

  // const [state, dispatch] = useStoreContext();

  // to be able to query on Click, data variable contains checkout session, only after the query is called with the getCheckout() function
  //data holds returned data from useLazyQuery
  const [getCheckout, { data }] = useLazyQuery(QUERY_CHECKOUT);

  useEffect(() => {
    async function getCart() {
      const cart = await idbPromise('cart', 'get');
      //return array of itmes from indexedDB
      dispatch({ type: ADD_MULTIPLE_TO_CART, products: [...cart] });
      // addMultipleToCart(cart)
    };
    //check if there is anything in the cart
    //state.cart
    if (!state.cart.length) {
      getCart();
    }
  }, [state.cart.length, dispatch]);

  //looks for change in data
  useEffect(() => {
    if (data) {
      stripePromise.then((res) => {
        res.redirectToCheckout({ sessionId: data.checkout.session });
      });
    }
  }, [data]);

  // console.log(state)
  function toggleCart() {
    dispatch({ type: TOGGLE_CART });
  }

  function calculateTotal() {
    let sum = 0;
    state.cart.forEach(item => {
      sum += item.price * item.purchaseQuantity;
    });
    return sum.toFixed(2);
  }

  if (!state.cartOpen) {
    return (
      <div className="cart-closed" onClick={toggleCart}>
        <span
          role="img"
          aria-label="trash">🛒</span>
      </div>
    );
  }
  //user clicks checkout, loops over the items saved in state.cart, adds Ids to new productIds array
  function submitCheckout() {
    const productIds = [];

    state.cart.forEach((item) => {
      for (let i = 0; i < item.purchaseQuantity; i++) {
        productIds.push(item._id);
      }
    });

    getCheckout({
      variables: { products: productIds }
    });
  }

  //toggle on cartOpen value when [close] text is clicked
  return (
    <div className="cart">
      <div className="close" onClick={toggleCart}>[close]</div>
      <h2>Shopping Cart</h2>
      {state.cart.length ? (
        <div>
          {state.cart.map(item => (
            <CartItem key={item._id} item={item} />
          ))}
          <div className="flex-row space-between">
            <strong>Total: ${calculateTotal()}</strong>
            {
              Auth.loggedIn() ?
                <button onClick={submitCheckout}>
                  Checkout
            </button>
                :
                <span>(log in to check out)</span>
            }
          </div>
        </div>
      ) : (
          <h3>
            <span role="img" aria-label="shocked">
              😱
      </span>
      You haven't added anything to your cart yet!
          </h3>
        )}
    </div>
  );
};
//cart props
// const mapStateToProps = (state /*, ownProps*/) => {
//   return {
//     cart: state.cart,
//     cartOpen: state.cartOpen
//   }
// }
// //cart props
// const mapDispatchToProps = (dispatch) => {
//   return {
//     addMultipleToCart: cart => dispatch({
//       type: ADD_MULTIPLE_TO_CART,
//       products: [...cart]
//     })
//   }
// }

export default Cart;
//wrap cart component to connect to redux store
// export default connect(
//   mapStateToProps,
//   mapDispatchToProps
// )(Cart)