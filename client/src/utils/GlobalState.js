//instantiate a new Context object - create container to hold global state. useContext = use state created from createContext
import React, { createContext, useContext } from "react";
import { useProductReducer } from './store/reducers';

const StoreContext = createContext();
//deconstruct the context created. Context = { Provider (wrap application to accept props), Consumer (grab and use data from Provider)}
const { Provider } = StoreContext;

//"custom" Provider component
const StoreProvider = ({ value = [], ...props }) => {
  const [state, dispatch] = useProductReducer({
    //instantiate initial global state
    products: [],
    cart: [],
    cartOpen: false,
    categories: [],
    currentCategory: '',
  });
  // use this to confirm it works!
  console.log(state);
  //return when useProductReducer is run. Need to return props or nothing will render
  return <Provider value={[state, dispatch]} {...props} />;
};

// When executed from within a component, we will receive the [state, dispatch] provided by StoreProvider
const useStoreContext = () => {
  return useContext(StoreContext);
};

// export { StoreProvider, useStoreContext };