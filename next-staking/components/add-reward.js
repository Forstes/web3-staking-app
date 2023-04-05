import { useState } from "react";
import styles from "@/styles/Deposit.module.scss";
import useWallet from "@/hooks/wallet";
import { ethers } from "ethers";
import { STAKING_CONTRACT_ADDRESS } from "@/constants/staking";
import { REWARD_TOKEN_ADDRESS } from "@/constants/staking";
import { STAKING_CONTRACT_ABI } from "@/constants/staking";
import { TOKEN_ABI } from "@/constants/staking";

export default function DepositToken() {
  const { signer } = useWallet();
  let stakingContract = new ethers.Contract(STAKING_CONTRACT_ADDRESS, STAKING_CONTRACT_ABI, signer);
  let tokenContract = new ethers.Contract(REWARD_TOKEN_ADDRESS, TOKEN_ABI, signer);

  const [amount, setAmount] = useState(0.00001);
  const handleAmountChange = (e) => setAmount(e.target.value);

  async function handleSubmit() {
    const amountFormatted = ethers.utils.parseEther(String(amount.toFixed(5)));

    try {
      await tokenContract.approve(stakingContract.address, amountFormatted);
      const tx = await stakingContract.addRewards(amountFormatted);
      await tx.wait(3);
      alert(`Success, transaction hash: ${tx.hash}`);
    } catch (error) {
      alert("Transaction failed");
      console.error(error);
    }
  }

  return (
    <div className={styles.box}>
      <h4>Fund staking contract with rewards</h4>

      <span>
        <label>Token amount</label>
        <input type="number" min="0.00001" step="0.00001" value={amount} onInput={handleAmountChange} />
      </span>

      <button className={styles.button} onClick={handleSubmit}>
        Fund contract
      </button>
    </div>
  );
}
