export function convertGCode(code: string, scale = 1, offsetX = 0, offsetY = 0): string {
  const rows = code.split('\n')
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
      if (dx !== undefined) {
        argsMap.X = dx * scale + (absolute ? offsetX : 0)
      }

      if (dy !== undefined) {
        argsMap.Y = dy * scale + (absolute ? offsetY : 0)
      }
    } else if (command === 'G90') {
      absolute = true
    } else if (command === 'G91') {
      absolute = false
    }

    // Add arguments to the line
    Object.keys(argsMap).forEach((key) => {
      line += ` ${key}${argsMap[key]}`
    })

    lines.push(line + (comment ? ' ; ' + comment : ''))
  }

  return lines.join('\n')
}
