export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-24 text-center">
      <h1 className="text-6xl font-black text-amber-500 mb-4">404</h1>
      <p className="text-muted-foreground mb-6">The page you&apos;re looking for doesn&apos;t exist.</p>
      <a
        href="/"
        className="inline-block px-6 py-2 bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold rounded-md"
      >
        Back to Home
      </a>
    </div>
  )
}
