import React, { useState } from 'react';

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
 *
 * A pointer-tracking specular sheen is added on top to sell the "liquid" feel
 * (highlight follows the cursor, like a light moving over glass).
 */
export const LiquidGlass = React.forwardRef<HTMLDivElement, LiquidGlassProps>(
  ({ className = '', as: Tag = 'div', children, style, onMouseMove, ...rest }, ref) => {
    const [pos, setPos] = useState({ x: 50, y: 50 });

    const handleMove: React.MouseEventHandler<HTMLDivElement> = (e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / Math.max(rect.width, 1)) * 100;
      const y = ((e.clientY - rect.top) / Math.max(rect.height, 1)) * 100;
      setPos({ x, y });
      onMouseMove?.(e);
    };

    const Component = Tag as any;
    return (
      <Component
        ref={ref}
        className={`liquid-glass ${className}`.trim()}
        style={{ '--lg-x': `${pos.x}%`, '--lg-y': `${pos.y}%`, ...style } as React.CSSProperties}
        onMouseMove={handleMove}
        {...rest}
      >
        <span className="liquid-glass__sheen" aria-hidden="true" />
        {children}
      </Component>
    );
  }
);

LiquidGlass.displayName = 'LiquidGlass';

export default LiquidGlass;