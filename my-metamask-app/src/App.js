import { useState } from "react";
import { ethers } from "ethers";

function App() {

  // Estados para almacenar información de la wallet y datos de transacción
  const [account, setAccount] = useState(null); // Almacena la dirección de la cuenta conectada
  const [balance, setBalance] = useState(null); // Almacena el saldo de ETH de la cuenta
  const [recipient, setRecipient] = useState(""); // Almacena la dirección del destinatario para envío
  const [amount, setAmount] = useState(""); // Almacena la cantidad de ETH a enviar

  // Conectar a MetaMask (siempre solicita la conexión)
  const connectWallet = async () => {
    if (window.ethereum) { // Verifica si MetaMask está instalado en el navegador
      try {
        // Crea un proveedor de Ethereum basado en el objeto window.ethereum inyectado por MetaMask
        const provider = new ethers.BrowserProvider(window.ethereum);

        // Solicita acceso a las cuentas del usuario (abre la ventana de MetaMask)
        const accounts = await provider.send("eth_requestAccounts", []);
        setAccount(accounts[0]); // Guarda la primera cuenta en el estado

        // Obtiene el saldo de ETH de la cuenta conectada
        const balance = await provider.getBalance(accounts[0]);
        setBalance(ethers.formatEther(balance)); // Convierte el saldo de wei a ETH y lo guarda
      } catch (error) {
        console.error("Error al conectar MetaMask", error); // Manejo de errores
      }
    } else {
      alert("MetaMask no está instalado."); // Muestra alerta si MetaMask no está instalado
    }
  };

  // Desconectar wallet - simulada
  const disconnectWallet = async () => {
    // Limpia todos los estados para simular una desconexión
    setAccount(null);
    setBalance(null);
    setRecipient("");
    setAmount("");

    // Muestra mensaje explicativo al usuario (la desconexión real debe hacerse desde MetaMask)
    alert("La desconexión se ha realizado en la aplicación. Para desconectar completamente, cierra la extensión MetaMask o cambia la cuenta en MetaMask. ¡Por favor, conéctate de nuevo!");
  };

  // Enviar ETH a otra dirección
  const sendEth = async () => {
    if (!window.ethereum) { // Verifica nuevamente si MetaMask está instalado
      alert("MetaMask no está instalado.");
      return;
    }

    if (!recipient || !amount) { // Valida que se hayan ingresado los datos necesarios
      alert("Por favor, ingresa una dirección válida y una cantidad.");
      return;
    }

    try {
      // Configura de nuevo el proveedor para la transacción
      const provider = new ethers.BrowserProvider(window.ethereum);
      // Obtiene el signer (firmante) que puede autorizar transacciones
      const signer = await provider.getSigner();

      // Envía la transacción con los parámetros especificados
      const tx = await signer.sendTransaction({
        to: recipient, // Dirección del destinatario
        value: ethers.parseEther(amount), // Convierte la cantidad de ETH a wei (unidad básica)
      });

      // Muestra confirmación con el hash de la transacción
      alert(`Transacción enviada! Hash: ${tx.hash}`);
      console.log("Transacción:", tx); // Log de la transacción completa para debugging

      // Actualiza el saldo tras la transacción para reflejar el nuevo balance
      const updatedBalance = await provider.getBalance(account);
      setBalance(ethers.formatEther(updatedBalance));

      // Limpia los campos del formulario tras enviar
      setRecipient("");
      setAmount("");
    } catch (error) {
      // Manejo de errores durante la transacción
      console.error("Error al enviar ETH", error);
      alert("Error al enviar ETH: " + error.message);
    }
  };

  // Interfaz de usuario (UI) renderizada con JSX
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Conectar MetaMask</h1>

      {account ? ( // Renderizado condicional: si hay cuenta conectada muestra info y controles
        <div style={styles.walletInfo}>
          <p style={styles.accountInfo}>Cuenta: {account}</p>
          <p style={styles.accountInfo}>Saldo: {balance} ETH</p>

          <h2 style={styles.subtitle}>Enviar ETH</h2>
          <input
            type="text"
            placeholder="Dirección del destinatario"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)} // Actualiza el estado al escribir
            style={styles.input}
          />
          <input
            type="number"
            placeholder="Cantidad en ETH"
            value={amount}
            onChange={(e) => setAmount(e.target.value)} // Actualiza el estado al escribir
            style={styles.input}
          />
          <button onClick={sendEth} style={styles.buttonSend}>
            Enviar ETH
          </button>
          <button onClick={disconnectWallet} style={styles.buttonDisconnect}>
            Desconectar
          </button>
        </div>
      ) : ( // Si no hay cuenta conectada, muestra solo el botón de conexión
        <div>
          <p style={styles.reconnectMessage}>¡Necesitas conectarte a MetaMask para continuar!</p>
          <button onClick={connectWallet} style={styles.buttonConnect}>
            Conectar Wallet
          </button>
        </div>
      )}
    </div>
  );
}

// Estilos 
const styles = {
  container: {
    textAlign: "center", 
    marginTop: "50px", 
    fontFamily: "'Arial', sans-serif",
    backgroundColor: "#f3f4f6",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", 
    maxWidth: "400px",
    margin: "auto",
  },
  title: {
    fontSize: "24px", 
    color: "#333", 
  },
  subtitle: {
    fontSize: "20px",
    color: "#555", 
    marginTop: "15px",
  },
  walletInfo: {
    marginTop: "20px", 
  },
  accountInfo: {
    fontSize: "16px", 
    color: "#555", 
    marginBottom: "10px", 
  },
  input: {
    width: "100%",
    padding: "10px",
    marginTop: "10px",
    borderRadius: "5px",
    border: "1px solid #ccc", 
    fontSize: "16px",
  },
  buttonConnect: {
    padding: "10px 20px", 
    fontSize: "16px", 
    backgroundColor: "#4CAF50",
    color: "white", 
    border: "none", 
    borderRadius: "5px", 
    cursor: "pointer", 
    transition: "background-color 0.3s",
  },
  buttonDisconnect: {
    padding: "10px 20px",
    fontSize: "16px", 
    marginTop: "10px", 
    backgroundColor: "#d9534f", 
    color: "white", 
    border: "none", 
    borderRadius: "5px", 
    cursor: "pointer", 
    transition: "background-color 0.3s", 
  },
  buttonSend: {
    padding: "10px 20px", 
    fontSize: "16px",
    marginTop: "10px", 
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "5px", 
    cursor: "pointer", 
    transition: "background-color 0.3s", 
  },
  reconnectMessage: {
    fontSize: "16px", 
    color: "#ff6347",
    marginTop: "10px", 
  },
};

export default App; // Exporta el componente para usarlo en la aplicación