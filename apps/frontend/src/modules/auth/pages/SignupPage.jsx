import { Link } from 'react-router-dom'
import RoutePath from '../../../core/constants/routes.constant.js'

function SignupPage() {
  return (
    <div className="signup-page">
      <h1>Sign Up</h1>
      <p>Signup form placeholder.</p>

      <p>
        Already have an account?{' '}
        <Link to={RoutePath.LOGIN} className="text-primary hover:underline">
          Login
        </Link>
      </p>
    </div>
  )
}

export default SignupPage
