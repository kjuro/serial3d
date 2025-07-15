# Serial3D - 3D Printer to Plotter Converter

A Vue.js web application that transforms your 3D printer into a precision 2D plotter using G-code commands over serial communication. This tool allows you to create drawings, plots, and vector graphics by controlling your printer's movement in the X and Y axes while using the Z-axis for pen up/down operations.

## Features

### Core Functionality
- **Serial Communication**: Direct connection to 3D printers via USB/serial interface
- **G-code Editor**: Built-in editor for creating and modifying G-code commands
- **Real-time Visualization**: SVG-based preview of your drawing with live position tracking
- **File Management**: Open, edit, and save G-code files (.gcode, .gco formats)

### Drawing Tools
- **Manual Control**: Directional movement controls with customizable step sizes (0.1mm to 10mm)
- **Pen Control**: Pen up/down operations using Z-axis movement
- **Position Tracking**: Real-time X/Y/Z coordinate display
- **Grid System**: Snap-to-grid functionality for precise positioning
- **Demo Patterns**: Built-in triangle and hexagon drawing examples

### Advanced Features
- **Scaling & Offset**: Transform drawings with percentage scaling and X/Y offset adjustments
- **Visual Feedback**: Live position indicator and movement path visualization
- **Queue Management**: Command queuing system with "OK" response handling
- **SVG Export**: Save your drawings as SVG vector files
- **Local Storage**: Persistent settings and preferences

## Hardware Requirements

- 3D printer with serial/USB connectivity (115200 baud rate)
- Pen or drawing tool that can be mounted on the print head
- Modern web browser with Web Serial API support (Chrome, Edge)

## Project Setup

```sh
pnpm install
```

### Development

```sh
pnpm dev
```

### Production Build

```sh
pnpm build
```

### Linting

```sh
pnpm lint
```

## Usage

1. **Connect Your Printer**: Click the plug icon to establish serial connection
2. **Load or Create G-code**: Use the folder icon to open existing files or create new drawings
3. **Preview**: View your drawing in the SVG viewer with grid overlay
4. **Adjust Settings**: Scale, offset, and configure movement parameters
5. **Send to Plotter**: Use the "Send" button to execute G-code on your printer
6. **Manual Control**: Use directional arrows for precise positioning

## Technical Stack

- **Frontend**: Vue 3 with TypeScript
- **UI Framework**: Bootstrap Vue Next
- **Build Tool**: Vite
- **Icons**: Lucide Vue Next
- **Serial Communication**: vue-serial library
- **State Management**: VueUse composables

## G-code Commands Supported

- `G0` - Rapid movement (pen up)
- `G1` - Linear movement (pen down) 
- `G28` - Home axes
- `G90/G91` - Absolute/relative positioning
- `G92` - Set position
- `M114` - Get current position

## Browser Compatibility

Requires a modern browser with Web Serial API support:
- Chrome 89+
- Edge 89+
- Opera 76+

## Contributing

This project uses ESLint for code quality and Prettier for formatting. Run `pnpm lint` before submitting changes.
