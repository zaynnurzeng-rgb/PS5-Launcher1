import React from 'react';

interface LiquidGlassProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Extra Tailwind classes merged after the base glass classes. */
  className?: string;
  /** Render as a different element (default: div). */
  as?: keyof React.JSX.IntrinsicElements;
  children?: React.ReactNode;
}

/**
 * Liquid-glass surface for the web.
 *
 * Web has no equivalent of Android's AGSL RenderEffect refraction, so this is
 * the closest honest approximation of BitChord's pipeline:
 *   backdrop blur(8px) + saturate(1.5)  ->  frosted tint  ->  specular rim
 *   (Plus blend, 45deg)  ->  outer shadow  ->  0.5px hairline edge.
 * True lens refraction / chromatic aberration is Android-only.
 */
export const LiquidGlass = React.forwardRef<HTMLDivElement, LiquidGlassProps>(
  ({ className = '', as: Tag = 'div', children, style, ...rest }, ref) => {
    const Component = Tag as any;
    return (
      <Component
        ref={ref}
        className={`liquid-glass ${className}`.trim()}
        style={style}
        {...rest}
      >
        {children}
      </Component>
    );
  }
);

LiquidGlass.displayName = 'LiquidGlass';

export default LiquidGlass;