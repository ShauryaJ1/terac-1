export default function AuthError() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-6 shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Authentication Error
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            There was a problem authenticating your account. Please try signing in again.
          </p>
          <div className="mt-6 text-center">
            <a
              href="/auth/signin"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
            >
              Return to sign in
            </a>
          </div>
        </div>
      </div>
    </div>
  )
} 