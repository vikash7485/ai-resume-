import { useState, useEffect } from 'react'
import { ethers } from 'ethers'

export function useFlareWallet() {
  const [account, setAccount] = useState(null)
  const [provider, setProvider] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [chainId, setChainId] = useState(null)

  useEffect(() => {
    checkConnection()
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged)
      window.ethereum.on('chainChanged', handleChainChanged)
    }
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
        window.ethereum.removeListener('chainChanged', handleChainChanged)
      }
    }
  }, [])

  const checkConnection = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum)
        const accounts = await provider.listAccounts()
        if (accounts.length > 0) {
          setAccount(accounts[0].address)
          setProvider(provider)
          setIsConnected(true)
          const network = await provider.getNetwork()
          setChainId(Number(network.chainId))
        }
      } catch (error) {
        console.error('Error checking connection:', error)
      }
    }
  }

  const connect = async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask or a Flare-compatible wallet')
      return
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      await provider.send('eth_requestAccounts', [])
      const signer = await provider.getSigner()
      const address = await signer.getAddress()
      const network = await provider.getNetwork()

      setAccount(address)
      setProvider(provider)
      setIsConnected(true)
      setChainId(Number(network.chainId))

      // Check if on Flare network
      const flareChainIds = [14, 114] // Mainnet and Testnet
      if (!flareChainIds.includes(Number(network.chainId))) {
        alert('Please switch to Flare Network')
      }

      return address
    } catch (error) {
      console.error('Error connecting wallet:', error)
      throw error
    }
  }

  const disconnect = () => {
    setAccount(null)
    setProvider(null)
    setIsConnected(false)
    setChainId(null)
  }

  const signMessage = async (message) => {
    if (!provider || !account) {
      throw new Error('Wallet not connected')
    }

    try {
      const signer = await provider.getSigner()
      const signature = await signer.signMessage(message)
      return signature
    } catch (error) {
      console.error('Error signing message:', error)
      throw error
    }
  }

  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      disconnect()
    } else {
      setAccount(accounts[0])
    }
  }

  const handleChainChanged = (chainId) => {
    setChainId(Number(chainId))
    window.location.reload()
  }

  return {
    account,
    provider,
    isConnected,
    chainId,
    connect,
    disconnect,
    signMessage,
  }
}

export default useFlareWallet

