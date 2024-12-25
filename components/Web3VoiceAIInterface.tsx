'use client'

import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { Button } from "./ui/button"
import { CreateAssistantForm } from "./CreateAssistantForm"
import Visualizer from "./Visualizer"
import useVapi from "@/hooks/use-vapi"
import { AssistantSelector } from "./AssistantSelector"

declare global {
  interface Window {
    ethereum?: ethers.Eip1193Provider
  }
}

interface Assistant {
  id: string;
  name: string;
}

export default function Web3VoiceAIInterface() {
  const [isConnected, setIsConnected] = useState(false)
  const [userAddress, setUserAddress] = useState('')
  const [error, setError] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [assistants, setAssistants] = useState<Assistant[]>([])
  const [selectedAssistant, setSelectedAssistant] = useState<Assistant | null>(null)
  const { conversation, isSessionActive, toggleCall } = useVapi()

  useEffect(() => {
    checkConnection()
  }, [])

  useEffect(() => {
    if (isConnected && userAddress) {
      const storedAssistants = localStorage.getItem(`assistants_${userAddress}`)
      if (storedAssistants) {
        setAssistants(JSON.parse(storedAssistants))
      }
    }
  }, [isConnected, userAddress])

  async function checkConnection() {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum)
        const accounts = await provider.listAccounts()
        if (accounts.length > 0) {
          setIsConnected(true)
          setUserAddress(accounts[0].address)
        }
      } catch (err) {
        console.error(err)
        setError('Failed to check wallet connection')
      }
    }
  }

  async function connectWallet() {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum)
        const accounts = await provider.send("eth_requestAccounts", [])
        const signer = await provider.getSigner()
        const address = await signer.getAddress()
        setIsConnected(true)
        setUserAddress(address)
        setError('')
      } catch (err) {
        console.error(err)
        setError('Failed to connect wallet')
      }
    } else {
      setError('Please install MetaMask or Trust Wallet')
    }
  }

  function disconnectWallet() {
    setIsConnected(false)
    setUserAddress('')
    setShowCreateForm(false)
    setSelectedAssistant(null)
    setAssistants([])
  }

  async function createAssistant(data: { name: string; systemPrompt: string; firstMessage: string }) {
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
      const updatedAssistants = [...assistants, newAssistant];
      setAssistants(updatedAssistants);
      localStorage.setItem(`assistants_${userAddress}`, JSON.stringify(updatedAssistants));
      
      setShowCreateForm(false)
      setSelectedAssistant(newAssistant)
    } catch (err) {
      console.error(err)
      setError('Failed to create assistant')
    }
  }

  function handleSelectAssistant(assistant: Assistant) {
    setSelectedAssistant(assistant)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md w-full max-w-md">
        <h1 className="mb-6 text-3xl font-bold text-center">Web3 x Voice AI</h1>
        {error && <p className="mb-4 text-red-500">{error}</p>}
        {isConnected ? (
          <div className="text-center">
            <p className="mb-4 text-xl font-semibold">Welcome! 😊</p>
            <p className="mb-4 text-sm text-gray-600">Connected Address: {userAddress}</p>
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
          <Button onClick={connectWallet}>Connect Wallet</Button>
        )}
      </div>
    </div>
  )
}

