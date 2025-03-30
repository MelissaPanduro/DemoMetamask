// Importamos React hooks y ethers.js
import { useState } from "react";  // Hook para manejar el estado en React
import { ethers } from "ethers";  // Biblioteca para interactuar con la blockchain de Ethereum

function App() {
  // Creamos un estado para almacenar la cuenta conectada de MetaMask
  const [account, setAccount] = useState(null);

  // Función para conectar la wallet de MetaMask
  const connectWallet = async () => {
    // Verificamos si MetaMask está instalado en el navegador
    if (window.ethereum) {
      try {
        // Creamos un proveedor de Ethereum usando ethers.js
        const provider = new ethers.BrowserProvider(window.ethereum);

        // Solicitamos a MetaMask que nos dé acceso a las cuentas del usuario
        const accounts = await provider.send("eth_requestAccounts", []);

        // Guardamos la primera cuenta obtenida en el estado
        setAccount(accounts[0]);
      } catch (error) {
        // Capturamos y mostramos cualquier error en la consola
        console.error("Error al conectar MetaMask", error);
      }
    } else {
      // Si MetaMask no está instalado, mostramos un mensaje de alerta
      alert("MetaMask no está instalado.");
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      {/* Título de la aplicación */}
      <h1>Conectar MetaMask</h1>

      {/* Botón para conectar MetaMask */}
      <button 
        onClick={connectWallet}  // Al hacer clic, ejecuta la función connectWallet
        style={{ padding: "10px 20px", fontSize: "16px" }}  // Estilos CSS en línea
      >
        {/* Si hay una cuenta conectada, muestra la dirección; si no, muestra "Conectar Wallet" */}
        {account ? `Conectado: ${account}` : "Conectar Wallet"}
      </button>
    </div>
  );
}

// Exportamos el componente para poder usarlo en la aplicación
export default App;

