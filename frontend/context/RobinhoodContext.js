import { createContext, useContext, useEffect, useState } from 'react'
import { useMoralis } from 'react-moralis'

const RobinhoodContext = createContext()

export const RobinhoodProvider = ({ children }) => {
    const [currentAccount, setCurrentAccount] = useState('')
    const [formattedAccount, setFormattedAccount] = useState('')
    const [coinSelect, setCoinSelect] = useState('DOGE')
    const [toCoin, setToCoin] = useState('')
    const [balance, setBalance] = useState('')
  
    const [amount, setAmount] = useState('')
  
    const { isAuthenticated, authenticate, user, logout, Moralis, enableWeb3 } = useMoralis()
  
    useEffect(() => {
      if (isAuthenticated) {
        const account = user.get('ethAddress')
        let formatAccount = account.slice(0, 4) + '...' + account.slice(-4)
        setFormattedAccount(formatAccount)
        setCurrentAccount(account)
        const balance = fetchCurrentBalance()
        const balanceToEth = Moralis.Units.FromWei(balance.balance)
        const formattedBalance = parseFloat(balanceToEth).toFixed(3)
        setBalance(formattedBalance)
      }

      const fetchCurrentBalance = async() => {
        const currentBalance = await Moralis.Web3API.account.getNativeBalance({
          chain: 'rinkeby',
          address: currentAccount
        })
        return currentBalance
      }
    }, [isAuthenticated, enableWeb3])
  
    useEffect(() => {
      if (!currentAccount) return
      ;(async () => {
        const response = await fetch('/api/createUser', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            walletAddress: currentAccount
          })
        })
        const data = await response.json()
      })()
    }, [currentAccount])
  
    const connectWallet = () => {
      authenticate()
    }
  
    const signOut = () => {
      console.log('Logged out')
      logout()
    }

    const value = {
      connectWallet,
      currentAccount,
      signOut,
      isAuthenticated,
      formattedAccount,
      setAmount
    }

    return (
      <RobinhoodContext.Provider value={value}>
        {children}
      </RobinhoodContext.Provider>
    )
}

export const useRobinhoodContext = () => useContext(RobinhoodContext)