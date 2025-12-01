'use client'

// BUG: Using 'any' type instead of proper types
export default function BuggyButton({ text, onClick }: any) {
  // BUG: Unnecessary function wrapper
  const handleClick = () => {
    console.log('Button clicked')
    onClick()
  }

  // BUG: Using inline styles instead of Tailwind classes
  // BUG: Style object has wrong properties
  return (
    <button 
      onClick={handleClick}
      style={{ 
        backgroundColor: 'blue', 
        color: 'white', 
        padding: '10px',
        border: 'none'
      }}
    >
      {text}
    </button>
  )
}
