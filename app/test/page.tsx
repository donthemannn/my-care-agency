export default function TestPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Test Page</h1>
        <p>If you can see this, the deployment is working!</p>
        <p>Timestamp: {new Date().toISOString()}</p>
      </div>
    </div>
  )
}
