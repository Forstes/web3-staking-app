import { ethers } from "ethers";
import { useContext, useEffect } from "react";
import WalletContext from "@/context/wallet";

export default function useWallet() {
  const {
    state: { address, provider, signer },
    dispatch,
  } = useContext(WalletContext);

  useEffect(() => {
    if (!window.ethereum) return;

    if (!window.ethereum._events || window.ethereum._events["accountsChanged"]?.length == 0) {
      window.ethereum.on("accountsChanged", (accounts) => {
        console.log(`Current user address: ${accounts[0]}`);
        dispatch({ signer: provider?.getSigner(accounts[0]) });
        dispatch({ address: accounts[0] });
      });
    }
  });

  async function connect() {
    return new Promise(async (resolve, reject) => {
      const provider = new ethers.providers.Web3Provider(window.ethereum, "any");

      if (!provider) reject("Install metamask");
      try {
        await provider.send("eth_requestAccounts", []);
        dispatch({ provider });

        let signer = provider.getSigner();
        dispatch({ signer });
        dispatch({ address: await signer.getAddress() });

        resolve(provider, signer);
      } catch (error) {
        console.error(error);
        reject("Connect your wallet");
      }
    });
  }
  return { connect, address, provider, signer };
}
