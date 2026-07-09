import { GrovkornetLogo } from '../GrovkornetLogo';

interface BrandingOverlayProps {
  children: React.ReactNode;
}

export default function BrandingOverlay({ children }: BrandingOverlayProps) {
  const grovkornetGlow = 'radial-gradient(circle at center, #1b1214 0%, #0a0a0c 100%), radial-gradient(circle at 20% 30%, rgba(255, 82, 56, 0.15) 0%, rgba(0,0,0,0) 60%), radial-gradient(circle at 80% 70%, rgba(255, 139, 56, 0.1) 0%, rgba(0,0,0,0) 60%)';
  return (
    <div
      id="grovsnap-canvas"
      className="canvas-wrapper"
      style={{
        background: grovkornetGlow,
        padding: '0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        minWidth: '600px',
        minHeight: '450px',
        width: 'fit-content', // allow expansion for long lines
        boxSizing: 'border-box',
        position: 'relative',
      }}
    >
      {/* Center: Code window */}
      <div style={{ width: 'fit-content', zIndex: 2, flexGrow: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-start' }}>
        {children}
      </div>

      {/* Bottom Right: Logo and Watermark stacked */}
      <div style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '6px',
        zIndex: 10,
        padding: '0 20px 20px 0',
      }}>
        <div style={{ paddingBottom: '2px' }}>
          <GrovkornetLogo />
        </div>
        <div style={{
          fontSize: '0.75rem',
          color: 'rgba(255, 255, 255, 0.35)',
          fontFamily: 'var(--font-mono)',
          letterSpacing: '0.5px',
        }}>
          @alexgiustizieri | grovkornet.com
        </div>
      </div>
    </div>
  );
}
