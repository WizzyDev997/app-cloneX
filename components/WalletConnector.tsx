import React from 'react'
import { Button } from "./ui/button"
import Image from 'next/image'

interface WalletConnectorProps {
  onConnect: (connector: 'injected' | 'walletConnect') => void
}

export function WalletConnector({ onConnect }: WalletConnectorProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Connect Your Wallet</h2>
      <Button 
        onClick={() => onConnect('walletConnect')} 
        className="w-full flex items-center justify-center space-x-2"
      >
        <Image src="/connect-removebg-preview.png" alt="WalletConnect" width={24} height={24} />
        <span>Connect with WalletConnect</span>
      </Button>
    </div>
  )
}

