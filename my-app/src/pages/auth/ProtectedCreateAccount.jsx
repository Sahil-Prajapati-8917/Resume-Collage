import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PasswordPrompt from '@/components/common/PasswordPrompt'
import CreateAccount from './CreateAccount'

const ProtectedCreateAccount = () => {
  const [isPasswordCorrect, setIsPasswordCorrect] = useState(false)
  const navigate = useNavigate()

  const handlePasswordCorrect = () => {
    setIsPasswordCorrect(true)
  }

  const handleCancel = () => {
    navigate('/login')
  }

  if (!isPasswordCorrect) {
    return (
      <PasswordPrompt
        onPasswordCorrect={handlePasswordCorrect}
        onCancel={handleCancel}
      />
    )
  }

  return <CreateAccount />
}

export default ProtectedCreateAccount
