import React from 'react'
import { Button } from "./ui/button"
import Image from 'next/image'

interface WalletConnectorProps {
  onConnect: (providerType: 'metamask' | 'trustwallet') => void
}

export function WalletConnector({ onConnect }: WalletConnectorProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Connect Your Wallet</h2>
      <Button 
        onClick={() => onConnect('metamask')} 
        className="w-full flex items-center justify-center space-x-2"
      >
        <span>MetaMask</span>
      </Button>
      <Button 
        onClick={() => onConnect('trustwallet')} 
        className="w-full flex items-center justify-center space-x-2"
      >
        <span>Trust Wallet</span>
      </Button>
    </div>
  )
}

