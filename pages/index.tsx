import BalanceCard from "components/balanceCard";
import Logo from "components/logo";
import Save from "components/save";
import TransactionCard from "components/transactionCard";
import WalletButton from "components/walletButton";

export default function Home() {
  return (
    <div className="container">
      <Logo />

      <WalletButton />

      <BalanceCard />

      <TransactionCard />

      <Save />
    </div>
  );
}
