import styles from "@/styles/Home.module.css";
import Image from "next/image";
import useWallet from "@/hooks/wallet";

export default function Navbar() {
  const { connect, address } = useWallet();

  function handleClick() {
    if (address) return;
    connect();
  }

  return (
    <nav className={styles.description}>
      <p>
        <code className={styles.code} onClick={handleClick}>
          {address || "connect"}
        </code>
      </p>
      <div>
        <a>
          Staking app <Image src="/staking_icon.png" alt="Logo" className={styles.vercelLogo} width={32} height={32} priority />
        </a>
      </div>
    </nav>
  );
}
