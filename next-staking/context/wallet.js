import { createContext, useReducer } from "react";

const WalletContext = createContext();

const initialState = {
  address: '',
  provider: null,
  signer: null
}

function reducer(state, action) {
  return { ...state, ...action };
}

export const WalletProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  return <WalletContext.Provider value={{state, dispatch}}>{children}</WalletContext.Provider>;
};

export default WalletContext;
