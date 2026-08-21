import { useAuth } from '../../core/hooks/useAuth.js'

export const useLogin = () => {
  const { login } = useAuth()
  return login
}
