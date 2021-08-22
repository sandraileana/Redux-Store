import React, { useEffect } from 'react';
import { UPDATE_CATEGORIES, UPDATE_CURRENT_CATEGORY } from '../../utils/store/actions';
import { useQuery } from '@apollo/react-hooks';
import { QUERY_CATEGORIES } from "../../utils/queries";
// import { useStoreContext } from "../../utils/GlobalState";
import { idbPromise } from '../../utils/helpers';
import { useDispatch, useSelector } from 'react-redux'

function CategoryMenu() {
  // const { data: categoryData } = useQuery(QUERY_CATEGORIES);
  // const categories = categoryData?.categories || [];
  const dispatch = useDispatch();
  //initialState from store => newState
  const state = useSelector(state => state);
  // immediately call, retrieve current state from global state object, .dispatch() method to update state
  // const [state, dispatch] = useStoreContext();
  //only need categories array out of global state, destructure to use in JSX
  const { categories } = state;
  //query category data and store into global state object
  //destrcuture loading variable; indicates waiting
  const { loading, data: categoryData } = useQuery(QUERY_CATEGORIES);

    //*** check if the useQuery() Hook's loading return value exists - pull from IndexedDB if not 
  useEffect(() => {
    // if categoryData exists or has changed from the response of useQuery, then run dispatch()
    if (categoryData) {
      dispatch({
        type: UPDATE_CATEGORIES,
        categories: categoryData.categories
      });
      //save to idb store
      categoryData.categories.forEach(category => {
        idbPromise('categories', 'put', category);
      });
    }
    else if (!loading) {
      idbPromise('categories', 'get').then(categories => {
        dispatch({
          type: UPDATE_CATEGORIES,
          categories: categories
        });
      });
    }
  }, [categoryData, loading, dispatch]);

  const handleClick = id => {
    dispatch({
      type: UPDATE_CURRENT_CATEGORY,
      currentCategory: id
    });
  };

  return (
    <div>
      <h2>Choose a Category:</h2>
      {categories.map(item => (
        <button
          key={item._id}
          onClick={() => {
            handleClick(item._id);
          }}
        >
          {item.name}
        </button>
      ))}
    </div>
  );

//   //cart props
// const mapStateToProps = (state /*, ownProps*/) => {
//   return {
//     cart: state.cart,
//     cartOpen: state.cartOpen
//   }
// }
// //cart props
// const mapDispatchToProps = (dispatch) => {
//   return {
//     updateCategories: cart => dispatch({
//       type: UPDATE_CATEGORIES,
//       products: [...cart]
//     })
//   }
// }
}

export default CategoryMenu;
// export default connect(
//   mapStateToProps,
//   mapDispatchToProps
// )(CategoryMenu)
