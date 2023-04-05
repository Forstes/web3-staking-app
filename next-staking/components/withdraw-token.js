import { useState } from "react";
import styles from "@/styles/Deposit.module.scss";
import useWallet from "@/hooks/wallet";
import { ethers } from "ethers";
import { STAKING_CONTRACT_ADDRESS } from "@/constants/staking";
import { STAKING_CONTRACT_ABI } from "@/constants/staking";

export default function DepositToken() {
  const { signer } = useWallet();
  let stakingContract = new ethers.Contract(STAKING_CONTRACT_ADDRESS, STAKING_CONTRACT_ABI, signer);

  stakingContract.on("Unstaked", (user, amount) => {
    const amountInEther = Number(ethers.utils.formatUnits(amount, 18)).toFixed(5);
    alert(`Successfully unstaked ${amountInEther}`);
  });

  const [address, setAddress] = useState("");
  const handleAddressChange = (e) => setAddress(e.target.value);

  async function handleSubmit() {
    try {
      const tx = await stakingContract.unstake(address);
      await tx.wait(3);
      alert(`Success, transaction hash: ${tx.hash}`);
    } catch (error) {
      if (error.message.includes("No reward accumulated")) {
        alert("You didn't staked the token with provided address");
      }
      console.error(error);
    }
  }

  return (
    <div className={styles.box}>
      <h4>Withdraw your staked tokens and reward</h4>

      <span>
        <label>Token address</label>
        <input value={address} onInput={handleAddressChange} />
      </span>

      <button className={styles.button} onClick={handleSubmit}>
        Withdraw
      </button>
    </div>
  );
}
