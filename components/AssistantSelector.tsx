import React from 'react'
import { Button } from "./ui/button"

interface Assistant {
  id: string;
  name: string;
}

interface AssistantSelectorProps {
  assistants: Assistant[];
  onSelect: (assistant: Assistant) => void;
  onCreateNew: () => void;
}

export function AssistantSelector({ assistants, onSelect, onCreateNew }: AssistantSelectorProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-2">Your Assistants</h2>
      {assistants.map((assistant) => (
        <Button
          key={assistant.id}
          onClick={() => onSelect(assistant)}
          className="w-full justify-start"
          variant="outline"
        >
          {assistant.name}
        </Button>
      ))}
      <Button onClick={onCreateNew} className="w-full">Create New Assistant</Button>
    </div>
  )
}

