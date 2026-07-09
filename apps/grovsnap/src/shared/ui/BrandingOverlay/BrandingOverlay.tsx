import { GrovkornetLogo } from '../GrovkornetLogo';

interface BrandingOverlayProps {
  children: React.ReactNode;
  seriesTag?: string;
  seriesNumber?: string;
}

export default function BrandingOverlay({ children, seriesTag, seriesNumber }: BrandingOverlayProps) {
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

      {/* Bottom Footer: Tag left, Logo/License right */}
      <div style={{
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        zIndex: 10,
        padding: '0 20px 20px 20px',
      }}>
        {/* Left side: Series Tag (if any) */}
        <div style={{
          fontSize: '0.85rem',
          color: 'rgba(255, 255, 255, 0.4)',
          fontFamily: 'var(--font-heading)',
          fontWeight: 500,
          letterSpacing: '1px',
          textTransform: 'uppercase',
          display: 'flex',
          gap: '6px'
        }}>
          {seriesTag && seriesTag !== 'None' && (
            <>
              <span>{seriesTag}</span>
              <span style={{ color: 'var(--accent-primary)' }}>#{seriesNumber}</span>
            </>
          )}
        </div>

        {/* Right side: Logo, License, Attribution */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: '8px',
        }}>
          <div style={{ paddingBottom: '4px' }}>
            <GrovkornetLogo />
          </div>
          <div style={{
            display: 'flex',
            gap: '12px',
            fontSize: '0.75rem',
            color: 'rgba(255, 255, 255, 0.35)',
            fontFamily: 'var(--font-mono)',
            letterSpacing: '0.5px',
          }}>
            <span>License: GPL-3.0</span>
            <span>|</span>
            <span>@alexgiustizieri</span>
            <span>|</span>
            <span>grovkornet.com</span>
          </div>
        </div>
      </div>
    </div>
  );
}
