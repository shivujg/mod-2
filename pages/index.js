import { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [transactionAmount, setTransactionAmount] = useState('');
  const [userInfo, setUserInfo] = useState('');
  const [showReceipt, setShowReceipt] = useState(false);
  const [totalCreditPoints, setTotalCreditPoints] = useState(0);

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }
  };

  const handleAccount = async (account) => {
    if (account) {
      console.log("Account connected: ", account);
      setAccount(account);
    } else {
      console.log("No account found");
    }
  };

  const connectAccount = async () => {
    if (!ethWallet) {
      alert("MetaMask wallet is required to connect");
      return;
    }

    const accounts = await ethWallet.request({ method: "eth_requestAccounts" });
    handleAccount(accounts[0]);

    // once wallet is set we can get a reference to our deployed contract
    getATMContract();
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);

    setATM(atmContract);
  };

  const getBalance = async () => {
    if (atm) {
      const newBalance = await atm.getBalance();
      setBalance(newBalance.toNumber());
      setTotalCreditPoints(newBalance.toNumber() > 100 ? 100 : 0);
    }
  };

  const deposit = async () => {
    if (atm && transactionAmount !== '') {
      let amount = parseInt(transactionAmount);
      let tx = await atm.deposit(amount);
      await tx.wait();
      getBalance();
      if (amount > 100) {
        setUserInfo(`You have earned 100 credit points for depositing ${amount} ETH`);
        setShowReceipt(true);
        setTotalCreditPoints(prevPoints => prevPoints + 100);
      }
    }
  };

  const withdraw = async () => {
    if (atm && transactionAmount !== '') {
      let amount = parseInt(transactionAmount);
      let tx = await atm.withdraw(amount);
      await tx.wait();
      getBalance();
      if (amount > 100) {
        setUserInfo(`You have earned 100 credit points for withdrawing ${amount} ETH`);
        setShowReceipt(true);
        setTotalCreditPoints(prevPoints => prevPoints + 100);
      }
    }
  };

  useEffect(() => {
    getWallet();
  }, []);

  useEffect(() => {
    if (ethWallet && account) {
      getATMContract();
    }
  }, [ethWallet, account]);

  useEffect(() => {
    if (atm) {
      getBalance();
    }
  }, [atm]);

  return (
    <main className="container">
      <header>
        <h1>Welcome to the Metacrafters ATM!</h1>
      </header>
      <div>
        {ethWallet ? (
          account ? (
            <div>
              <p>Your Account: {account}</p>
              {balance !== undefined && <p>Your Balance: {balance}</p>}
              {!showReceipt && <p>Total Credit Points: {totalCreditPoints}</p>}
              {showReceipt && <div>{userInfo.split('\n').map((line, index) => <p key={index}>{line}</p>)}</div>}
              <input type="number" placeholder="Enter amount" value={transactionAmount} onChange={(e) => setTransactionAmount(e.target.value)} />
              <button onClick={deposit}>Deposit</button>
              <button onClick={withdraw}>Withdraw</button>
              <button onClick={() => {setUserInfo(`Name: Shivakumar\nCollege: RV College\nCourse: Engineering\nBranch: Electrical and Electronics Engineering\nDate of Opening: ${new Date().toLocaleDateString()}`); setShowReceipt(true)}}>User Info</button>
              <button onClick={() => {setUserInfo(''); setShowReceipt(false)}}>Clear Info</button>
              {showReceipt && <button onClick={() => window.print()}>Confirm Print</button>}
            </div>
          ) : (
            <button onClick={connectAccount}>Please connect your Metamask wallet</button>
          )
        ) : (
          <p>Please install Metamask in order to use this ATM.</p>
        )}
      </div>
      <style jsx>{`
        .container {
          text-align: center;
          font-family: Arial, sans-serif;
          color: #333;
        }

        input {
          margin: 10px;
          padding: 5px;
          border: 1px solid #ccc;
          border-radius: 5px;
        }

        button {
          margin: 10px;
          padding: 10px 20px;
          background-color: #007bff;
          color: #fff;
          border: none;
          border-radius: 5px;
          cursor: pointer;
        }

        button:hover {
          background-color: #0056b3;
        }

        p {
          margin: 5px;
        }
      `}</style>
    </main>
  );
}
