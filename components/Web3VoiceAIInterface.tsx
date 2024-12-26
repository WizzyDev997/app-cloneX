'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from "./ui/button"
import { CreateAssistantForm } from "./CreateAssistantForm"
import Visualizer from "./Visualizer"
import useVapi from "@/hooks/use-vapi"
import { AssistantSelector } from "./AssistantSelector"
import { WalletConnector } from "./WalletConnector"
import { useAccount, useConnect, useDisconnect } from 'wagmi'

interface Assistant {
  id: string;
  name: string;
}

export default function Web3VoiceAIInterface() {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [assistants, setAssistants] = useState<Assistant[]>([])
  const [selectedAssistant, setSelectedAssistant] = useState<Assistant | null>(null)
  const { conversation, isSessionActive, toggleCall } = useVapi()
  const { address, isConnected } = useAccount()
  const { connectAsync, connectors } = useConnect()
  const { disconnectAsync } = useDisconnect()

  useEffect(() => {
    if (isConnected && address) {
      const storedAssistants = localStorage.getItem(`assistants_${address}`)
      if (storedAssistants) {
        setAssistants(JSON.parse(storedAssistants))
      }
    }
  }, [isConnected, address])

  const connectWallet = useCallback(async (connectorId: 'injected' | 'walletConnect') => {
    try {
      const connector = connectors.find(c => 
        (connectorId === 'injected' && c.id === 'metaMask') || 
        (connectorId === 'walletConnect' && c.id === 'walletConnect')
      )
      if (connector) {
        await connectAsync({ connector })
      } else {
        console.error('Connector not found')
      }
    } catch (error) {
      console.error('Failed to connect:', error)
    }
  }, [connectors, connectAsync])

  const disconnectWallet = useCallback(async () => {
    try {
      await disconnectAsync()
      setShowCreateForm(false)
      setSelectedAssistant(null)
      setAssistants([])
    } catch (error) {
      console.error('Failed to disconnect:', error)
    }
  }, [disconnectAsync])

  const createAssistant = useCallback(async (data: { name: string; systemPrompt: string; firstMessage: string }) => {
    try {
      const response = await fetch("https://api.vapi.ai/assistant", {
        method: "POST",
        headers: {
          "Authorization": "Bearer df093b6b-29d3-41f6-8c7f-a57bad5e672d",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          "transcriber": {
            "provider": "deepgram",
            "codeSwitchingEnabled": true,
            "model": "nova-2"
          },
          "model": {
            "provider": "openai",
            "model": "gpt-4o-mini",
            "messages": [
              {
                "role": "system",
                "content": data.systemPrompt
              }
            ],
            "emotionRecognitionEnabled": true
          },
          "firstMessage": data.firstMessage,
          "voice": {
            "provider": "11labs",
            "voiceId": "joseph",
            "model": "eleven_multilingual_v2"
          },
          "name": data.name
        }),
      });

      const body = await response.json();
      console.log(body);
      
      const newAssistant = { id: body.id, name: data.name };
      setAssistants(prev => {
        const updatedAssistants = [...prev, newAssistant];
        if (address) {
          localStorage.setItem(`assistants_${address}`, JSON.stringify(updatedAssistants));
        }
        return updatedAssistants;
      });
      
      setShowCreateForm(false)
      setSelectedAssistant(newAssistant)
    } catch (err) {
      console.error(err)
      // Handle error (e.g., show error message to user)
    }
  }, [address])

  const handleSelectAssistant = useCallback((assistant: Assistant) => {
    setSelectedAssistant(assistant)
  }, [])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md w-full max-w-md">
        <h1 className="mb-6 text-3xl font-bold text-center">CloneX App</h1>
        {isConnected ? (
          <div className="text-center">
            <p className="mb-4 text-xl font-semibold">Welcome! 😊</p>
            <p className="mb-4 text-sm text-gray-600">Connected Address: {address}</p>
            {selectedAssistant ? (
              <div>
                <h2 className="text-xl font-semibold mb-4">Talking to: {selectedAssistant.name}</h2>
                <Visualizer assistantId={selectedAssistant.id} />
                <div className="mt-4 max-h-60 overflow-y-auto">
                  {conversation.map((msg, index) => (
                    <div key={index} className={`mb-2 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                      <span className={`inline-block p-2 rounded ${msg.role === 'user' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                        {msg.text}
                      </span>
                    </div>
                  ))}
                </div>
                {!isSessionActive && (
                  <Button onClick={() => setSelectedAssistant(null)} className="mt-4">
                    Choose Another Assistant
                  </Button>
                )}
              </div>
            ) : showCreateForm ? (
              <CreateAssistantForm onSubmit={createAssistant} />
            ) : (
              <AssistantSelector
                assistants={assistants}
                onSelect={handleSelectAssistant}
                onCreateNew={() => setShowCreateForm(true)}
              />
            )}
            <Button onClick={disconnectWallet} className="mt-4">Disconnect Wallet</Button>
          </div>
        ) : (
          <WalletConnector onConnect={connectWallet} />
        )}
      </div>
    </div>
  )
}

