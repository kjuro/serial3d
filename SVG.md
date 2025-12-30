# SVG Format Documentation

## Overview

SVG (Scalable Vector Graphics) is an XML-based vector image format that defines graphics using markup. SVG images are infinitely scalable without loss of quality and can include interactive and animated elements.

## Key Features

- **Vector-based**: Uses mathematical descriptions of shapes rather than pixels
- **Scalable**: Can be resized to any size without quality loss
- **Text-based**: Human-readable XML format
- **Interactive**: Supports CSS styling, JavaScript, and animations
- **Web-friendly**: Natively supported by modern browsers

## Basic Structure

```xml
<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" 
     width="100" height="100" 
     viewBox="0 0 100 100">
  <!-- SVG content goes here -->
</svg>
```

## Common SVG Elements and Tags

### Root Element

#### `<svg>`
The root container element that defines the SVG canvas.

**Key Attributes:**
- `width`, `height`: Canvas dimensions
- `viewBox`: Coordinate system (x, y, width, height)
- `xmlns`: XML namespace declaration
- `version`: SVG version specification

### Basic Shape Elements

#### `<rect>`
Draws rectangles and squares.
```xml
<rect x="10" y="10" width="80" height="60" fill="blue" stroke="black" stroke-width="2"/>
```

**Attributes:**
- `x`, `y`: Top-left corner position
- `width`, `height`: Rectangle dimensions
- `rx`, `ry`: Corner radius for rounded rectangles

#### `<circle>`
Draws circles.
```xml
<circle cx="50" cy="50" r="30" fill="red"/>
```

**Attributes:**
- `cx`, `cy`: Center coordinates
- `r`: Radius

#### `<ellipse>`
Draws ellipses.
```xml
<ellipse cx="50" cy="50" rx="40" ry="20" fill="green"/>
```

**Attributes:**
- `cx`, `cy`: Center coordinates
- `rx`, `ry`: Horizontal and vertical radii

#### `<line>`
Draws straight lines.
```xml
<line x1="0" y1="0" x2="100" y2="100" stroke="black" stroke-width="2"/>
```

**Attributes:**
- `x1`, `y1`: Start point coordinates
- `x2`, `y2`: End point coordinates

#### `<polyline>`
Draws connected line segments.
```xml
<polyline points="10,10 50,50 90,10" fill="none" stroke="blue" stroke-width="2"/>
```

**Attributes:**
- `points`: Space or comma-separated list of coordinate pairs

#### `<polygon>`
Draws closed shapes with straight sides.
```xml
<polygon points="50,10 90,90 10,90" fill="yellow" stroke="black"/>
```

**Attributes:**
- `points`: Space or comma-separated list of coordinate pairs

#### `<path>`
Most versatile element for drawing complex shapes using path commands.
```xml
<path d="M 10 10 L 50 50 Q 90 10 100 50 Z" fill="orange"/>
```

**Path Commands:**
- `M`: Move to (x,y)
- `L`: Line to (x,y)
- `H`: Horizontal line to x
- `V`: Vertical line to y
- `C`: Cubic Bézier curve
- `Q`: Quadratic Bézier curve
- `A`: Elliptical arc
- `Z`: Close path

### Text Elements

#### `<text>`
Renders text.
```xml
<text x="10" y="50" font-family="Arial" font-size="14" fill="black">Hello World</text>
```

**Attributes:**
- `x`, `y`: Text position
- `font-family`, `font-size`: Typography properties
- `text-anchor`: Text alignment (start, middle, end)

#### `<tspan>`
Defines text spans within `<text>` elements for fine-grained text control.

### Container and Grouping Elements

#### `<g>`
Groups elements together for collective transformations and styling.
```xml
<g transform="translate(50,50) rotate(45)" fill="blue">
  <rect width="30" height="30"/>
  <circle cx="40" cy="0" r="15"/>
</g>
```

#### `<defs>`
Contains reusable elements like gradients, patterns, and symbols.
```xml
<defs>
  <linearGradient id="grad1">
    <stop offset="0%" stop-color="red"/>
    <stop offset="100%" stop-color="blue"/>
  </linearGradient>
</defs>
```

#### `<symbol>`
Defines reusable graphic symbols.

#### `<use>`
References and renders elements defined elsewhere.
```xml
<use href="#mySymbol" x="10" y="10"/>
```

### Styling and Effects

#### Common Style Attributes
- `fill`: Interior color (color name, hex, rgb, url for gradients/patterns)
- `stroke`: Outline color
- `stroke-width`: Outline thickness
- `stroke-dasharray`: Dashed outline pattern
- `opacity`: Transparency (0.0 to 1.0)
- `fill-opacity`: Fill transparency
- `stroke-opacity`: Stroke transparency

#### Gradients

##### `<linearGradient>`
Creates linear color transitions.
```xml
<linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
  <stop offset="0%" stop-color="red"/>
  <stop offset="100%" stop-color="blue"/>
</linearGradient>
```

##### `<radialGradient>`
Creates radial color transitions.
```xml
<radialGradient id="grad2" cx="50%" cy="50%" r="50%">
  <stop offset="0%" stop-color="white"/>
  <stop offset="100%" stop-color="black"/>
</radialGradient>
```

#### `<pattern>`
Defines repeating patterns for fills.

### Transformations

Applied via the `transform` attribute:
- `translate(x,y)`: Move element
- `rotate(angle)`: Rotate element
- `scale(x,y)`: Scale element
- `skewX(angle)`, `skewY(angle)`: Skew element
- `matrix(a,b,c,d,e,f)`: Apply transformation matrix

### Metadata and Documentation

#### `<title>`
Provides accessible title for the SVG.

#### `<desc>`
Contains description for accessibility and documentation.

#### `<metadata>`
Contains metadata about the SVG document (often using RDF/Dublin Core).

### Namespaces

Common namespaces used in SVG:
- `xmlns="http://www.w3.org/2000/svg"`: Default SVG namespace
- `xmlns:xlink="http://www.w3.org/1999/xlink"`: XLink for references
- `xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape"`: Inkscape-specific
- `xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd"`: Sodipodi-specific

## Coordinate System

SVG uses a coordinate system where:
- Origin (0,0) is at the top-left corner
- X-axis increases to the right
- Y-axis increases downward
- Units can be pixels, percentages, or other CSS units

## ViewBox

The `viewBox` attribute defines the coordinate system and aspect ratio:
```xml
viewBox="min-x min-y width height"
```

This allows SVG content to scale proportionally within the defined viewport.

## Best Practices

1. **Use viewBox** for scalable graphics
2. **Group related elements** with `<g>` tags
3. **Define reusable elements** in `<defs>`
4. **Use semantic naming** for IDs and classes
5. **Optimize paths** by removing unnecessary precision
6. **Include accessibility** information with `<title>` and `<desc>`
7. **Minify for production** to reduce file size

## Example: Complete SVG

```xml
<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" 
     width="200" height="200" 
     viewBox="0 0 200 200">
  
  <title>Simple Sun Icon</title>
  <desc>A basic sun icon with rays</desc>
  
  <defs>
    <radialGradient id="sunGradient" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ffeb3b"/>
      <stop offset="100%" stop-color="#ff9800"/>
    </radialGradient>
  </defs>
  
  <!-- Sun rays -->
  <g stroke="#ff9800" stroke-width="3" stroke-linecap="round">
    <line x1="100" y1="20" x2="100" y2="40"/>
    <line x1="100" y1="160" x2="100" y2="180"/>
    <line x1="20" y1="100" x2="40" y2="100"/>
    <line x1="160" y1="100" x2="180" y2="100"/>
    <line x1="41.42" y1="41.42" x2="55.56" y2="55.56"/>
    <line x1="144.44" y1="144.44" x2="158.58" y2="158.58"/>
    <line x1="158.58" y1="41.42" x2="144.44" y2="55.56"/>
    <line x1="55.56" y1="144.44" x2="41.42" y2="158.58"/>
  </g>
  
  <!-- Sun body -->
  <circle cx="100" cy="100" r="50" fill="url(#sunGradient)" stroke="#ff9800" stroke-width="2"/>
  
</svg>
```

This documentation covers the essential SVG elements and concepts needed to understand and work with SVG files, including the examples found in this project's svg directory.
