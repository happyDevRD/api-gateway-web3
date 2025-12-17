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

  useEffect(() => {
    if (account) {
      checkAccess(account)
    }
  }, [account])

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" })
        setAccount(accounts[0])
      } catch (err) {
        console.error(err)
        setError("Failed to connect wallet")
      }
    } else {
      setError("Please install Metamask")
    }
  }

  const checkAccess = async (user) => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const contract = new ethers.Contract(CONTRACT_ADDRESS, AccessRegistry, provider)
      const access = await contract.hasAccess(user)
      setHasAccess(access)
    } catch (err) {
      console.error(err)
      setError("Failed to check access")
    }
  }

  const grantAccess = async () => {
    try {
      setLoading(true)
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const contract = new ethers.Contract(CONTRACT_ADDRESS, AccessRegistry, signer)
      const tx = await contract.grantAccess(account)
      await tx.wait()
      setLoading(false)
      checkAccess(account)
    } catch (err) {
      console.error(err)
      setLoading(false)
      setError("Transaction failed: " + err.message)
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
        throw new Error("403 Forbidden - Access Denied by Gateway")
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

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-800 p-8 rounded-xl shadow-2xl border border-slate-700">
        <h1 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
          Web3 API Gateway
        </h1>

        {!account ? (
          <button
            onClick={connectWallet}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-all"
          >
            Connect Wallet
          </button>
        ) : (
          <div className="space-y-6">
            <div className="bg-slate-700/50 p-4 rounded-lg">
              <p className="text-sm text-slate-400 mb-1">Connected Account</p>
              <p className="font-mono text-xs break-all text-emerald-300">{account}</p>
            </div>

            <div className="flex items-center justify-between bg-slate-700/50 p-4 rounded-lg">
              <span className="text-slate-300">Access Status</span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${hasAccess ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
                  }`}
              >
                {hasAccess ? "GRANTED" : "DENIED"}
              </span>
            </div>

            {!hasAccess && (
              <button
                onClick={grantAccess}
                disabled={loading}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white py-3 rounded-lg font-medium transition-all flex justify-center items-center"
              >
                {loading ? "Processing..." : "Grant Access (On-Chain)"}
              </button>
            )}

            <button
              onClick={callApi}
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white py-3 rounded-lg font-medium transition-all flex justify-center items-center"
            >
              {loading ? "Fetching..." : "Call Protected API"}
            </button>

            {apiData && (
              <div className="mt-4 p-4 bg-black/30 rounded-lg border border-slate-600">
                <p className="text-xs text-slate-500 mb-1">API Response:</p>
                <p className="font-mono text-sm text-blue-300">{apiData}</p>
              </div>
            )}

            {error && (
              <div className="mt-4 p-3 bg-red-900/50 text-red-200 text-sm rounded-lg border border-red-800">
                {error}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default App
