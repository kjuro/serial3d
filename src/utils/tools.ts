export function scaleGCode(code: string[], scale = 1): string[] {
  return convertGCode(code, (x, y) => ({
    x: x !== undefined ? x * scale : undefined,
    y: y !== undefined ? y * scale : undefined
  }))
}

export function moveGCode(code: string[], offsetX = 0, offsetY = 0): string[] {
  return convertGCode(code, (x, y, absolute) => ({
    x: x !== undefined ? x + (absolute ? offsetX : 0) : undefined,
    y: y !== undefined ? y + (absolute ? offsetY : 0) : undefined
  }))
}

export function convertGCode(rows: string[], convert: (x: number, y: number, absolute: boolean) => { x?: number; y?: number }): string[] {
  const lines: string[] = []

  let absolute = true

  for (let row of rows) {
    // Split line to command and comments
    const commentIndex = row.indexOf(';')
    let comment = ''
    if (commentIndex !== -1) {
      comment = row.slice(commentIndex + 1).trim()
      row = row.slice(0, commentIndex)
    }

    row = row.trim()
    if (row === '') {
      lines.push(comment ? ' ; ' + comment : '')
      continue
    }

    const [command, ...args] = row.split(' ')
    let line = command

    // Arguments start with a letter XYZ plus number. Store arguments in map

    const argsMap: Record<string, number> = {}
    for (const arg of args) {
      const letter = arg[0]
      const value = parseFloat(arg.slice(1))
      argsMap[letter] = value
    }

    const dx = argsMap.X
    const dy = argsMap.Y

    if (command === 'G0' || command === 'G1') {
      const converted = convert(dx, dy, absolute)
      if (dx !== undefined) {
        argsMap.X = converted.x as number
      }

      if (dy !== undefined) {
        argsMap.Y = converted.y as number
      }
    } else if (command === 'G90') {
      absolute = true
    } else if (command === 'G91') {
      absolute = false
    }

    // Add arguments to the line
    Object.keys(argsMap).forEach((key) => {
      const value = argsMap[key]
      if (typeof value === 'number' && !isNaN(value) && value % 1 !== 0) {
        // Check if the value has decimal digits
        line += ` ${key}${toFixed(value)}`
      } else {
        line += ` ${key}${value}`
      }
    })

    lines.push(line + (comment ? ' ; ' + comment : ''))
  }

  return lines
}

/**
 * Formats a number to a fixed number of decimal places if it has decimal digits.
 * If the number is an integer, it returns the number as a string without formatting.
 *
 * @param value - The number to format.
 * @param precision - The number of decimal places to format to (default is 6).
 * @returns The formatted number as a string.
 */
export function toFixed(value: number, precision = 2): string {
  return value % 1 === 0 ? value.toString() : value.toFixed(precision)
}

export function getArgumentsMap(args: string[]): Record<string, number> {
  // Get X, Y, Z values
  const argsMap: Record<string, number> = {}
  for (const arg of args) {
    const letter = arg[0]
    const value = parseFloat(arg.slice(1))
    argsMap[letter] = value
  }

  return argsMap
}
