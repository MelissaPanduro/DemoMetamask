import { useState, useEffect, useCallback, useMemo } from "react"; // Importamos los hooks de React
import { ethers } from "ethers"; // Importamos ethers para interactuar con la blockchain

function App() {
  // Definimos estados para manejar la información de la wallet y transacciones
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState(null);
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentNetwork, setCurrentNetwork] = useState(null);
  const [isNetworkSwitching, setIsNetworkSwitching] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState(null);

  // Definimos las redes disponibles y usamos useMemo para evitar recrearlas en cada renderizado
  const networks = useMemo(() => [
    {
      name: "Ethereum Mainnet",
      chainId: "0x1",
      symbol: "ETH",
      rpcUrl: "https://mainnet.infura.io/v3/your-infura-key"
    },
    {
      name: "Sepolia Testnet",
      chainId: "0xaa36a7",
      symbol: "SepoliaETH",
      rpcUrl: "https://sepolia.infura.io/v3/your-infura-key"
    },
    {
      name: "Holesky Testnet",
      chainId: "0x4268",
      symbol: "ETH",
      rpcUrl: "https://holesky.infura.io/v3/your-infura-key"
    },
  ], []);

  // Verifica la red actual y obtiene el saldo de la cuenta conectada
  const checkNetwork = useCallback(async () => {
    try {
      if (!window.ethereum || !account) return;
      
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      const network = networks.find(net => net.chainId === chainId);
      setCurrentNetwork(network ? network.name : `Red Desconocida (${chainId})`);
      
      if (account) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const balance = await provider.getBalance(account);
        setBalance(ethers.formatEther(balance));
      }
    } catch (error) {
      console.error("Error al verificar la red", error);
    }
  }, [account, networks]); 

  // Ejecuta checkNetwork al detectar cambios en la cuenta o red
  useEffect(() => {
    if (window.ethereum && account) {
      checkNetwork();
      
      const handleChainChanged = () => {
        checkNetwork();
      };
      
      window.ethereum.on('chainChanged', handleChainChanged);
      
      return () => {
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [account, checkNetwork]);


  // Cambia la red de MetaMask
  const switchNetwork = async (chainId) => {
    if (!window.ethereum) {
      alert("MetaMask no está instalado.");
      return;
    }

    try {
      setIsNetworkSwitching(true);
      
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId }],
      });
      
      await checkNetwork();
      
    } catch (switchError) {
      if (switchError.code === 4902) {
        try {
          const networkDetails = networks.find(net => net.chainId === chainId);
          
          if (!networkDetails) {
            throw new Error("Detalles de la red no encontrados");
          }
          
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: networkDetails.chainId,
                chainName: networkDetails.name,
                nativeCurrency: {
                  name: networkDetails.symbol,
                  symbol: networkDetails.symbol,
                  decimals: 18
                },
                rpcUrls: [networkDetails.rpcUrl],
                blockExplorerUrls: networkDetails.blockExplorer ? [networkDetails.blockExplorer] : null,
              },
            ],
          });
          
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId }],
          });
          
          await checkNetwork();
          
        } catch (addError) {
          console.error("Error al añadir la red:", addError);
          alert("No se pudo añadir la red: " + addError.message);
        }
      } else {
        console.error("Error al cambiar la red:", switchError);
        alert("Error al cambiar la red: " + switchError.message);
      }
    } finally {
      setIsNetworkSwitching(false);
    }
  };

  const handleNetworkChange = (e) => {
    const chainId = e.target.value;
    if (chainId) {
      setSelectedNetwork(chainId);
      switchNetwork(chainId);
    }
  };


  // Conectar la wallet del usuario con la aplicación
  const connectWallet = async () => {

    if (window.ethereum) {
      try {
        setLoading(true);

        const provider = new ethers.BrowserProvider(window.ethereum);

        const accounts = await provider.send("eth_requestAccounts", []);
        setAccount(accounts[0]);

        const balance = await provider.getBalance(accounts[0]);
        setBalance(ethers.formatEther(balance));
        
        await checkNetwork();
        
        setLoading(false);
      } catch (error) {
        console.error("Error al conectar MetaMask", error);
        setLoading(false);
      }
    } else {
      alert("MetaMask no está instalado.");
    }
  };

  // Enviar ETH a otra dirección
  const sendEth = async () => {
    if (!window.ethereum) {
      alert("MetaMask no está instalado.");
      return;
    }

    if (!recipient || !amount) {
      alert("Por favor, ingresa una dirección válida y una cantidad.");
      return;
    }

    try {
      setLoading(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const tx = await signer.sendTransaction({
        to: recipient,
        value: ethers.parseEther(amount),
      });

      alert(`Transacción enviada! Hash: ${tx.hash}`);
      console.log("Transacción:", tx);

      const updatedBalance = await provider.getBalance(account);
      setBalance(ethers.formatEther(updatedBalance));

      setRecipient("");
      setAmount("");
      setLoading(false);
    } catch (error) {
      console.error("Error al enviar ETH", error);
      alert("Error al enviar ETH: " + error.message);
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Conectar MetaMask</h1>

      {account ? (
        <div style={styles.walletInfo}>
          <p style={styles.accountInfo}>Cuenta: {account}</p>
          <p style={styles.accountInfo}>Saldo: {balance} ETH</p>
          <p style={styles.networkInfo}>Red actual: {currentNetwork}</p>

          <div style={styles.networkSelector}>
            <h3 style={styles.networkTitle}>Cambiar Red</h3>
            <select 
              onChange={handleNetworkChange} 
              style={styles.networkDropdown}
              disabled={isNetworkSwitching}
              value={selectedNetwork || ""}
            >
              <option value="">Selecciona una red</option>
              {networks.map((network) => (
                <option 
                  key={network.chainId} 
                  value={network.chainId}
                >
                  {network.name}
                </option>
              ))}
            </select>
            {isNetworkSwitching && (
              <p style={styles.loadingText}>Cambiando red...</p>
            )}
          </div>

          <h2 style={styles.subtitle}>Enviar ETH</h2>
          <input
            type="text"
            placeholder="Dirección del destinatario"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            style={styles.input}
          />
          <input
            type="number"
            placeholder="Cantidad en ETH"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={styles.input}
          />
          <button 
            onClick={sendEth} 
            style={styles.buttonSend}
            disabled={loading || isNetworkSwitching}
          >
            {loading ? "Procesando..." : "Enviar ETH"}
          </button>
        </div>
      ) : (
        <div>
          <p style={styles.message}>Conecta tu wallet para enviar ETH</p>
          <button 
            onClick={connectWallet} 
            style={styles.buttonConnect}
            disabled={loading}
          >
            {loading ? "Conectando..." : "Conectar Wallet"}
          </button>
        </div>
      )}
    </div>
  );
}

// Estilos para la interfaz
const styles = {
  container: {
    textAlign: "center", 
    marginTop: "50px",
    fontFamily: "Arial, sans-serif",
    backgroundColor: "#f5f7fa",
    padding: "30px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
    maxWidth: "450px",
    margin: "0 auto"
  },
  title: {
    fontSize: "28px",
    color: "#333",
    marginBottom: "20px"
  },
  walletInfo: {
    marginTop: "25px"
  },
  accountInfo: {
    fontSize: "16px",
    color: "#555",
    wordBreak: "break-all",
    marginBottom: "10px"
  },
  networkInfo: {
    fontSize: "16px",
    color: "#2962ff",
    fontWeight: "bold",
    marginBottom: "15px"
  },
  subtitle: {
    fontSize: "22px",
    color: "#444",
    marginTop: "20px",
    marginBottom: "15px"
  },
  input: {
    width: "100%",
    padding: "12px",
    marginTop: "12px",
    borderRadius: "6px",
    border: "1px solid #ddd",
    fontSize: "16px",
    boxSizing: "border-box"
  },
  message: {
    fontSize: "18px",
    color: "#666",
    marginBottom: "20px"
  },
  buttonConnect: {
    padding: "12px 24px",
    fontSize: "16px",
    backgroundColor: "#4CAF50",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "background-color 0.3s",
    fontWeight: "bold"
  },
  buttonSend: {
    padding: "12px 24px",
    fontSize: "16px",
    marginTop: "15px",
    backgroundColor: "#2196F3",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "background-color 0.3s",
    fontWeight: "bold",
    width: "100%"
  },
  networkSelector: {
    marginTop: "25px",
    padding: "15px",
    backgroundColor: "#f0f0f0",
    borderRadius: "8px",
    border: "1px solid #ddd"
  },
  networkTitle: {
    fontSize: "18px",
    color: "#333",
    marginBottom: "12px"
  },
  networkDropdown: {
    width: "100%",
    padding: "10px",
    fontSize: "16px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    backgroundColor: "#fff",
    cursor: "pointer"
  },
  loadingText: {
    fontSize: "14px",
    color: "#666",
    fontStyle: "italic",
    margin: "8px 0 0 0"
  }
};

export default App;