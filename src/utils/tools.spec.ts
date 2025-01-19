import { convertGCode } from './tools.ts'
import { describe, it, expect } from 'vitest'

const gCode = `
G90 ; absolute positioning
G0 X100 Y100 Z10
G0 Z0
G1 X200 Y200
G91 ; relative positioning
G1 X10 Y10
G1 X-20 Y-20
`

const gCodeScalled = `
G90 ; absolute positioning
G0 X200 Y200 Z10
G0 Z0
G1 X400 Y400
G91 ; relative positioning
G1 X20 Y20
G1 X-40 Y-40
`

const gCodeTransformed = `
G90 ; absolute positioning
G0 X210 Y220 Z10
G0 Z0
G1 X410 Y420
G91 ; relative positioning
G1 X20 Y20
G1 X-40 Y-40
`

describe('convertGCode', () => {
  it('should not change G-code if no transform is defined', () => {
    const result = convertGCode(gCode, 1, 0, 0)
    expect(result).toEqual(gCode)
  })

  it('should scale G-code', () => {
    const result = convertGCode(gCode, 2, 0, 0)
    expect(result).toEqual(gCodeScalled)
  })

  it('should scale and transform G-code', () => {
    const result = convertGCode(gCode, 2, 10, 20)
    expect(result).toEqual(gCodeTransformed)
  })
})
