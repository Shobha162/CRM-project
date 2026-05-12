import React from 'react'

function Heading({ text }) {
  return (
    <div className='flex items-center'>
      <h2
        className='text-lg lg:text-2xl font-medium'
        style={{ color: 'var(--color-textColor)' }}
      >
        {text}
      </h2>
    </div>

  )
}

export default Heading