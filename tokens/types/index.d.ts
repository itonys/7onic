/**
 * 7onic Design Tokens — TypeScript type definitions
 * ⚠️ Auto-generated — DO NOT EDIT
 */

type Shade = '50' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
type ShadeRecord = Record<Shade, string>;

export declare const colors: {
  white: string;
  black: string;
  gray: ShadeRecord;
  primary: ShadeRecord;
  secondary: ShadeRecord;
  blue: ShadeRecord;
  green: ShadeRecord;
  yellow: ShadeRecord;
  red: ShadeRecord;
  chart: ShadeRecord;
};

export declare const spacing: Record<'0' | '0.5' | '1' | '1.5' | '2' | '2.5' | '3' | '4' | '5' | '6' | '7' | '8' | '10' | '12' | '14' | '16' | '20' | '24', string>;

export declare const fontSize: Record<'2xs' | 'xs' | 'sm' | 'md' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl', { size: string; lineHeight: string }>;

export declare const borderRadius: Record<'none' | 'sm' | 'base' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full', string>;

export declare const shadow: Record<'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'primary-glow', string>;

export declare const zIndex: Record<'0' | '10' | '20' | '30' | '40' | '50' | 'sticky' | 'dropdown' | 'overlay' | 'modal' | 'popover' | 'tooltip' | 'toast', string | number>;

export declare const duration: Record<'instant' | 'fast' | 'micro' | 'normal' | 'slow' | 'slower' | 'slowest', string>;

export declare const iconSize: Record<'2xs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl', string>;

export declare const opacity: Record<'0' | '5' | '10' | '15' | '20' | '25' | '30' | '35' | '40' | '45' | '50' | '55' | '60' | '65' | '70' | '75' | '80' | '85' | '90' | '95' | '100', string>;

export declare const fontWeight: Record<'normal' | 'semibold' | 'bold', string>;

export declare const borderWidth: Record<'0' | '1' | '2' | '4' | '8', string>;

export declare const scale: Record<'50' | '75' | '95' | 'pressed', string>;

export declare const easing: Record<'linear' | 'ease' | 'easeIn' | 'easeOut' | 'easeInOut', string>;

export declare const breakpoint: Record<'sm' | 'md' | 'lg' | 'xl' | '2xl', string>;

export declare const fontFamily: Record<'sans' | 'mono', string>;

export declare const componentSize: {
  switch: {
    track: {
      sm: { width: string; height: string };
      default: { width: string; height: string };
      lg: { width: string; height: string };
    };
    thumb: {
      sm: string;
      default: string;
      lg: string;
    };
  };
  slider: {
    thumb: {
      sm: string;
      default: string;
      lg: string;
    };
  };
};

export declare const animation: {
  'checkbox-enter': { scale: string; opacity: string; duration: string; easing: string };
  'radio-enter': { scale: string; opacity: string; duration: string; easing: string };
  'fade-in': { opacity: string; duration: string; easing: string };
  'fade-out': { opacity: string; duration: string; easing: string };
  'modal-overlay-enter': { opacity: string; duration: string; easing: string };
  'modal-overlay-exit': { opacity: string; duration: string; easing: string };
  'modal-content-enter': { translateY: string; scale: string; opacity: string; duration: string; easing: string };
  'modal-content-exit': { translateY: string; scale: string; opacity: string; duration: string; easing: string };
  'nav-viewport-enter': { translateY: string; scale: string; opacity: string; duration: string; easing: string };
  'nav-viewport-exit': { translateY: string; scale: string; opacity: string; duration: string; easing: string };
  'accordion-down': { heightVar: string; duration: string; easing: string };
  'accordion-up': { heightVar: string; duration: string; easing: string };
  'collapsible-down': { heightVar: string; duration: string; easing: string };
  'collapsible-up': { heightVar: string; duration: string; easing: string };
  'drawer-right-enter': { translateX: string; duration: string; easing: string };
  'drawer-right-exit': { translateX: string; duration: string; easing: string };
  'drawer-left-enter': { translateX: string; duration: string; easing: string };
  'drawer-left-exit': { translateX: string; duration: string; easing: string };
  'drawer-top-enter': { translateY: string; duration: string; easing: string };
  'drawer-top-exit': { translateY: string; duration: string; easing: string };
  'drawer-bottom-enter': { translateY: string; duration: string; easing: string };
  'drawer-bottom-exit': { translateY: string; duration: string; easing: string };
  'tooltip-top-enter': { translateY: string; opacity: string; duration: string; easing: string };
  'tooltip-top-exit': { translateY: string; opacity: string; duration: string; easing: string };
  'tooltip-bottom-enter': { translateY: string; opacity: string; duration: string; easing: string };
  'tooltip-bottom-exit': { translateY: string; opacity: string; duration: string; easing: string };
  'tooltip-right-enter': { translateX: string; opacity: string; duration: string; easing: string };
  'tooltip-right-exit': { translateX: string; opacity: string; duration: string; easing: string };
  'tooltip-left-enter': { translateX: string; opacity: string; duration: string; easing: string };
  'tooltip-left-exit': { translateX: string; opacity: string; duration: string; easing: string };
  'popover-top-enter': { translateY: string; opacity: string; duration: string; easing: string };
  'popover-top-exit': { translateY: string; opacity: string; duration: string; easing: string };
  'popover-bottom-enter': { translateY: string; opacity: string; duration: string; easing: string };
  'popover-bottom-exit': { translateY: string; opacity: string; duration: string; easing: string };
  'popover-right-enter': { translateX: string; opacity: string; duration: string; easing: string };
  'popover-right-exit': { translateX: string; opacity: string; duration: string; easing: string };
  'popover-left-enter': { translateX: string; opacity: string; duration: string; easing: string };
  'popover-left-exit': { translateX: string; opacity: string; duration: string; easing: string };
  'toast-slide-in-right': { translateX: string; opacity: string; duration: string; easing: string };
  'toast-slide-out-right': { translateX: string; opacity: string; duration: string; easing: string };
  'toast-slide-in-left': { translateX: string; opacity: string; duration: string; easing: string };
  'toast-slide-out-left': { translateX: string; opacity: string; duration: string; easing: string };
  'toast-slide-in-top': { translateY: string; opacity: string; duration: string; easing: string };
  'toast-slide-out-top': { translateY: string; opacity: string; duration: string; easing: string };
  'toast-slide-in-bottom': { translateY: string; opacity: string; duration: string; easing: string };
  'toast-slide-out-bottom': { translateY: string; opacity: string; duration: string; easing: string };
  'spin': { duration: string; easing: string };
};

export declare const typography: {
  heading: {
    '1': { fontFamily: string; fontSize: string; fontWeight: string; lineHeight: string };
    '2': { fontFamily: string; fontSize: string; fontWeight: string; lineHeight: string };
    '3': { fontFamily: string; fontSize: string; fontWeight: string; lineHeight: string };
    '4': { fontFamily: string; fontSize: string; fontWeight: string; lineHeight: string };
    '5': { fontFamily: string; fontSize: string; fontWeight: string; lineHeight: string };
    '6': { fontFamily: string; fontSize: string; fontWeight: string; lineHeight: string };
  };
  body: {
    'lg': { fontFamily: string; fontSize: string; fontWeight: string; lineHeight: string };
    'default': { fontFamily: string; fontSize: string; fontWeight: string; lineHeight: string };
    'md': { fontFamily: string; fontSize: string; fontWeight: string; lineHeight: string };
    'sm': { fontFamily: string; fontSize: string; fontWeight: string; lineHeight: string };
    'xs': { fontFamily: string; fontSize: string; fontWeight: string; lineHeight: string };
    '2xs': { fontFamily: string; fontSize: string; fontWeight: string; lineHeight: string };
  };
  label: {
    'lg': { fontFamily: string; fontSize: string; fontWeight: string; lineHeight: string };
    'md': { fontFamily: string; fontSize: string; fontWeight: string; lineHeight: string };
    'default': { fontFamily: string; fontSize: string; fontWeight: string; lineHeight: string };
    'sm': { fontFamily: string; fontSize: string; fontWeight: string; lineHeight: string };
    'xs': { fontFamily: string; fontSize: string; fontWeight: string; lineHeight: string };
  };
  caption: { fontFamily: string; fontSize: string; fontWeight: string; lineHeight: string };
  code: {
    'block': { fontFamily: string; fontSize: string; fontWeight: string; lineHeight: string };
    'inline': { fontFamily: string; fontSize: string; fontWeight: string; lineHeight: string };
  };
};

// Named type aliases for convenience
export type Colors = typeof colors;
export type Spacing = typeof spacing;
export type FontSize = typeof fontSize;
export type BorderRadius = typeof borderRadius;
export type Shadow = typeof shadow;
export type ZIndex = typeof zIndex;
export type Duration = typeof duration;
export type IconSize = typeof iconSize;
export type Opacity = typeof opacity;
export type FontWeight = typeof fontWeight;
export type BorderWidth = typeof borderWidth;
export type Scale = typeof scale;
export type Easing = typeof easing;
export type Breakpoint = typeof breakpoint;
export type FontFamily = typeof fontFamily;
export type ComponentSize = typeof componentSize;
export type Animation = typeof animation;
export type Typography = typeof typography;

declare const tokens: {
  colors: typeof colors;
  spacing: typeof spacing;
  fontSize: typeof fontSize;
  borderRadius: typeof borderRadius;
  shadow: typeof shadow;
  zIndex: typeof zIndex;
  duration: typeof duration;
  iconSize: typeof iconSize;
  opacity: typeof opacity;
  fontWeight: typeof fontWeight;
  borderWidth: typeof borderWidth;
  scale: typeof scale;
  easing: typeof easing;
  breakpoint: typeof breakpoint;
  fontFamily: typeof fontFamily;
  componentSize: typeof componentSize;
  animation: typeof animation;
  typography: typeof typography;
};
export default tokens;
