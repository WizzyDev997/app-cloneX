import { useState } from 'react'
import { Button } from "./ui/button"
import { Input } from "./input"
import { Textarea } from "./textarea"

interface CreateAssistantFormProps {
  onSubmit: (data: {
    name: string;
    systemPrompt: string;
    firstMessage: string;
    languageRecognitionEnabled: boolean;
  }) => void;
}

export function CreateAssistantForm({ onSubmit }: CreateAssistantFormProps) {
  const [name, setName] = useState('')
  const [systemPrompt, setSystemPrompt] = useState('')
  const [firstMessage, setFirstMessage] = useState('')
  const [languageRecognitionEnabled, setLanguageRecognitionEnabled] = useState(true)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({ name, systemPrompt, firstMessage, languageRecognitionEnabled })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Assistant Name</label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="mt-1"
        />
      </div>
      <div>
        <label htmlFor="systemPrompt" className="block text-sm font-medium text-gray-700">System Prompt</label>
        <Textarea
          id="systemPrompt"
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
          required
          className="mt-1"
        />
      </div>
      <div>
        <label htmlFor="firstMessage" className="block text-sm font-medium text-gray-700">First Message</label>
        <Input
          id="firstMessage"
          value={firstMessage}
          onChange={(e) => setFirstMessage(e.target.value)}
          required
          className="mt-1"
        />
      </div>
      <Button type="submit">Create Assistant</Button>
    </form>
  )
}
