'use client'

import React from 'react'

interface ButtonProps {
  text: string
  onClick: () => void
}

export default function BuggyButtonFixed({ text, onClick }: ButtonProps) {
  return (
    <button 
      onClick={onClick}
      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-semibold"
    >
      {text}
    </button>
  )
}
