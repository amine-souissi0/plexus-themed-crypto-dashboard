import Link from 'next/link';

export default function About() {
  return (
    <main className="container">
      <h1 style={{ fontSize: 28, margin: 0 }}>About this demo</h1>
      <p className="small" style={{ marginTop: 8 }}>
        A tiny Next.js app to showcase DevOps + full-stack skills for Web3 recruitment contexts.
      </p>

      <div className="card" style={{ padding: 16, marginTop: 16 }}>
        <h2 style={{ marginTop: 0 }}>Why it’s relevant for Web3 (Plexus context)</h2>
        <ul>
          <li>Cloud-native: containerizable and deployable to modern platforms.</li>
          <li>Serverless API route (Next.js) fetches 3rd-party data securely.</li>
          <li>Production touches: caching headers, health endpoint, simple CI.</li>
          <li>UX polish: dark mode, search, auto-refresh, sparklines.</li>
          <li>Easy to extend: alerts, auth, or infra-as-code (Terraform/K8s).</li>
        </ul>
        <p className="small">
          Links:{' '}
          <a className="link" href="https://plexusrs.com/" target="_blank" rel="noreferrer">PlexusRS</a>
          {' '}•{' '}
          <a className="link" href="https://calendly.com/aaron-bennett-plexusrs/intro" target="_blank" rel="noreferrer">Book with Aaron</a>
          {' '}•{' '}
          <Link className="link" href="/">Back to dashboard</Link>
        </p>
      </div>
    </main>
  );
}
