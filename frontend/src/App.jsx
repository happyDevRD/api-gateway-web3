import { useState, useEffect } from "react"
import { ethers } from "ethers"
import AccessRegistry from "./AccessRegistry.json"

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"

function App() {
  const [account, setAccount] = useState(null)
  const [hasAccess, setHasAccess] = useState(false)
  const [apiData, setApiData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [userRole, setUserRoleState] = useState("")

  useEffect(() => {
    if (account) {
      checkAccess(account)
    }
  }, [account])
  /* Admin State */
  const [targetAddress, setTargetAddress] = useState("")
  const [targetRole, setTargetRole] = useState("")
  const [policyPath, setPolicyPath] = useState("")
  const [policyRole, setPolicyRole] = useState("")

  useEffect(() => {
    const checkNetwork = async () => {
      if (window.ethereum) {
        const chainId = await window.ethereum.request({ method: "eth_chainId" })
        if (chainId !== "0x7a69") { // 31337
          setError("¡Red Incorrecta! Por favor cambia a Localhost 8545 (Chain ID: 31337)")
          try {
            await window.ethereum.request({
              method: "wallet_switchEthereumChain",
              params: [{ chainId: "0x7a69" }],
            })
          } catch (switchError) {
            // This error code indicates that the chain has not been added to MetaMask.
            if (switchError.code === 4902) {
              setError("Por favor añade la red Localhost a MetaMask manualmente.")
            }
          }
        }
      }
    }
    checkNetwork()
  }, [])

  /* ... Existing Helpers ... */

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" })
        setAccount(accounts[0])
      } catch (err) {
        console.error(err)
        if (err.code === 4001) {
          setError("Rechazaste la conexión en MetaMask.")
        } else {
          setError("Error al conectar: " + (err.message || err))
        }
      }
    } else {
      setError("Por favor instala MetaMask")
    }
  }

  const checkAccess = async (user) => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const contract = new ethers.Contract(CONTRACT_ADDRESS, AccessRegistry, provider)

      const role = await contract.userRoles(user)
      setUserRoleState(role)

      const access = await contract.checkAccessForAddress("/api/data", user)
      setHasAccess(access)
    } catch (err) {
      console.error(err)
      setError("Error al verificar acceso")
    }
  }

  const setRoleUser = async () => {
    try {
      setLoading(true)
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const contract = new ethers.Contract(CONTRACT_ADDRESS, AccessRegistry, signer)
      const tx = await contract.setUserRole(account, "USER")
      await tx.wait()
      setLoading(false)
      checkAccess(account)
    } catch (err) {
      console.error(err)
      setLoading(false)
      setError("Transacción fallida: " + err.message)
    }
  }

  const callApi = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/data", {
        headers: {
          "X-Web3-Address": account,
        },
      })
      if (response.status === 403) {
        throw new Error("403 Forbidden - Acceso Denegado por Gateway")
      }
      const text = await response.text()
      setApiData(text)
      setLoading(false)
    } catch (err) {
      console.error(err)
      setLoading(false)
      setApiData("Error: " + err.message)
    }
  }

  const assignRole = async () => {
    if (!targetAddress || !targetRole) return
    try {
      setLoading(true)
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const contract = new ethers.Contract(CONTRACT_ADDRESS, AccessRegistry, signer)
      const tx = await contract.setUserRole(targetAddress, targetRole)
      await tx.wait()
      setLoading(false)
      alert(`Rol ${targetRole} asignado a ${targetAddress}`)
    } catch (err) {
      console.error(err)
      setLoading(false)
      setError("Asignar Rol falló: " + err.message)
    }
  }

  const setPolicy = async () => {
    if (!policyPath || !policyRole) return
    try {
      setLoading(true)
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const contract = new ethers.Contract(CONTRACT_ADDRESS, AccessRegistry, signer)
      // Access granted = true
      const tx = await contract.setAccess(policyPath, policyRole, true)
      await tx.wait()
      setLoading(false)
      alert(`Política Verificada: ${policyRole} ahora accede a ${policyPath}`)
    } catch (err) {
      console.error(err)
      setLoading(false)
      setError("Definir Política falló: " + err.message)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center p-8">
      <div className="max-w-4xl w-full">
        <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
          Panel Admin API Gateway Web3
        </h1>

        {!account ? (
          <div className="flex justify-center">
            <button
              onClick={connectWallet}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-all shadow-lg shadow-blue-500/20"
            >
              Conectar Billetera al Dashboard
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* LEFT COLUMN: USER CONSOLE */}
            <div className="space-y-6">

              {/* STATUS CARD */}
              <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl">
                <h2 className="text-lg font-semibold text-emerald-400 mb-4">Tu Identidad</h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wide">Dirección de Billetera</p>
                    <p className="font-mono text-sm break-all text-slate-200">{account}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wide">Rol Asignado</p>
                    <p className="font-mono text-sm font-bold text-purple-400">{userRole || "NINGUNO"}</p>
                  </div>
                </div>
              </div>

              {/* TEST CONSOLE CARD */}
              <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl">
                <h2 className="text-lg font-semibold text-blue-400 mb-4">Prueba de Acceso</h2>

                <div className="flex items-center justify-between bg-slate-700/50 p-3 rounded-lg border border-slate-600 mb-4">
                  <span className="text-slate-300 text-sm font-mono">/api/data</span>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${hasAccess ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>
                    {hasAccess ? "AUTORIZADO" : "PROHIBIDO"}
                  </span>
                </div>

                <div className="flex gap-2 mb-4">
                  {!hasAccess && (
                    <button onClick={setRoleUser} disabled={loading} className="flex-1 bg-purple-600/80 hover:bg-purple-600 text-white text-sm py-2 rounded transition-colors">
                      Auto-Asignar Rol USER
                    </button>
                  )}
                  <button onClick={callApi} disabled={loading} className="flex-1 bg-emerald-600/80 hover:bg-emerald-600 text-white text-sm py-2 rounded transition-colors">
                    Llamar API
                  </button>
                </div>

                {apiData && (
                  <div className="p-3 bg-black/40 rounded border border-slate-600/50">
                    <p className="text-[10px] text-slate-500 mb-1 uppercase">Respuesta del Servidor</p>
                    <p className="font-mono text-sm text-green-300">{apiData}</p>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN: ADMIN TOOLS */}
            <div className="space-y-6">

              {/* ROLE MANAGER CARD */}
              <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl">
                <h2 className="text-lg font-semibold text-purple-400 mb-4">Gestor de Roles</h2>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Dirección Objetivo</label>
                    <div className="flex gap-2">
                      <input
                        value={targetAddress}
                        onChange={(e) => setTargetAddress(e.target.value)}
                        placeholder="0x..."
                        className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-sm font-mono text-white focus:border-purple-500 outline-none"
                      />
                      <button onClick={() => setTargetAddress(account)} className="text-xs bg-slate-700 px-2 rounded hover:bg-slate-600">Usar mi dirección</button>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Nombre del Rol</label>
                    <div className="flex gap-2 mb-2">
                      <button onClick={() => setTargetRole("ADMIN")} className="text-xs bg-purple-900/50 text-purple-300 px-2 py-1 rounded border border-purple-800 hover:bg-purple-900">ADMIN</button>
                      <button onClick={() => setTargetRole("USER")} className="text-xs bg-purple-900/50 text-purple-300 px-2 py-1 rounded border border-purple-800 hover:bg-purple-900">USER</button>
                    </div>
                    <input
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      placeholder="ej. ADMIN"
                      className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-sm text-white focus:border-purple-500 outline-none"
                    />
                  </div>
                  <button
                    onClick={assignRole}
                    disabled={loading || !targetAddress || !targetRole}
                    className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white py-2 rounded font-medium text-sm transition-all"
                  >
                    Asignar Rol
                  </button>
                </div>
              </div>

              {/* POLICY MANAGER CARD */}
              <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl">
                <h2 className="text-lg font-semibold text-orange-400 mb-4">Gestor de Políticas</h2>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Ruta API</label>
                    <div className="flex gap-2 mb-2">
                      <button onClick={() => setPolicyPath("/api/data")} className="text-xs bg-orange-900/50 text-orange-300 px-2 py-1 rounded border border-orange-800 hover:bg-orange-900">/api/data</button>
                      <button onClick={() => setPolicyPath("/api/admin")} className="text-xs bg-orange-900/50 text-orange-300 px-2 py-1 rounded border border-orange-800 hover:bg-orange-900">/api/admin</button>
                    </div>
                    <input
                      value={policyPath}
                      onChange={(e) => setPolicyPath(e.target.value)}
                      placeholder="ej. /api/admin"
                      className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-sm font-mono text-white focus:border-orange-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Rol Requerido</label>
                    <div className="flex gap-2 mb-2">
                      <button onClick={() => setPolicyRole("ADMIN")} className="text-xs bg-orange-900/50 text-orange-300 px-2 py-1 rounded border border-orange-800 hover:bg-orange-900">ADMIN</button>
                      <button onClick={() => setPolicyRole("USER")} className="text-xs bg-orange-900/50 text-orange-300 px-2 py-1 rounded border border-orange-800 hover:bg-orange-900">USER</button>
                    </div>
                    <input
                      value={policyRole}
                      onChange={(e) => setPolicyRole(e.target.value)}
                      placeholder="ej. ADMIN"
                      className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-sm text-white focus:border-orange-500 outline-none"
                    />
                  </div>
                  <button
                    onClick={setPolicy}
                    disabled={loading || !policyPath || !policyRole}
                    className="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white py-2 rounded font-medium text-sm transition-all"
                  >
                    Establecer Política de Acceso
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {error && (
          <div className="mt-6 p-4 bg-red-900/50 text-red-200 text-sm rounded-lg border border-red-800 text-center animate-pulse">
            {error}
          </div>
        )}
      </div>
    </div>
  )
}

export default App
