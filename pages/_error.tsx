import type { NextPageContext } from 'next'

function ErrorPage({ statusCode }: { statusCode: number }) {
  return (
    <div style={{
      backgroundColor: '#0A0B1E',
      color: '#F8FAFC',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, sans-serif',
      padding: '1rem',
    }}>
      <div style={{ textAlign: 'center', maxWidth: '28rem' }}>
        <h1 style={{ fontSize: '4rem', fontWeight: 900, color: '#8B5CF6', marginBottom: '0.5rem' }}>
          {statusCode}
        </h1>
        <p style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.75rem' }}>
          {statusCode === 404 ? 'Page Not Found' : 'Server Error'}
        </p>
        <p style={{ color: '#94A3B8', marginBottom: '1.5rem' }}>
          {statusCode === 404
            ? 'The page you are looking for does not exist.'
            : 'Something went wrong on our end. Please try again later.'}
        </p>
        <a href="/" style={{
          display: 'inline-block',
          fontWeight: 600,
          padding: '0.5rem 1.5rem',
          borderRadius: '0.5rem',
          textDecoration: 'none',
          background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
          color: '#FFFFFF',
        }}>
          Back to Home
        </a>
      </div>
    </div>
  )
}

ErrorPage.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode ?? 500 : 404
  return { statusCode }
}

export default ErrorPage
