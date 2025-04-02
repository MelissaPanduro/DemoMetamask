// Importamos React hooks y ethers.js
import { useState } from "react";  // Hook para manejar el estado en React
import { ethers } from "ethers";  // Biblioteca para interactuar con la blockchain de Ethereum

function App() {
  // Creamos estados para almacenar información de la wallet y transacción
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState(null);
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  // Función para conectar la wallet de MetaMask
  const connectWallet = async () => {
    // Verificamos si MetaMask está instalado en el navegador
    if (window.ethereum) {
      try {
        setLoading(true);
        // Creamos un proveedor de Ethereum usando ethers.js
        const provider = new ethers.BrowserProvider(window.ethereum);

        // Solicitamos a MetaMask que nos dé acceso a las cuentas del usuario
        const accounts = await provider.send("eth_requestAccounts", []);

        // Guardamos la primera cuenta obtenida en el estado
        setAccount(accounts[0]);

        // Obtenemos y guardamos el saldo de la cuenta
        const balance = await provider.getBalance(accounts[0]);
        setBalance(ethers.formatEther(balance));
        
        setLoading(false);
      } catch (error) {
        // Capturamos y mostramos cualquier error en la consola
        console.error("Error al conectar MetaMask", error);
        setLoading(false);
      }
    } else {
      // Si MetaMask no está instalado, mostramos un mensaje de alerta
      alert("MetaMask no está instalado.");
    }
  };

  // Función para enviar ETH a otra dirección
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

      // Actualizar saldo después de la transacción
      const updatedBalance = await provider.getBalance(account);
      setBalance(ethers.formatEther(updatedBalance));

      // Limpiar los inputs
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
      {/* Título de la aplicación */}
      <h1 style={styles.title}>Conectar MetaMask</h1>

      {/* Mostrar interfaz según si hay cuenta conectada o no */}
      {account ? (
        <div style={styles.walletInfo}>
          {/* Información de la cuenta */}
          <p style={styles.accountInfo}>Cuenta: {account}</p>
          <p style={styles.accountInfo}>Saldo: {balance} ETH</p>

          {/* Formulario para enviar ETH */}
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
            disabled={loading}
          >
            {loading ? "Procesando..." : "Enviar ETH"}
          </button>
        </div>
      ) : (
        <div>
          {/* Mensaje y botón para conectar */}
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
  }
};

// Exportamos el componente para poder usarlo en la aplicación
export default App;