import { scaleGCode, moveGCode } from './tools.ts'
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

const home = `
G90 ; absolute positioning
G0 X0 Y0
G0 Z0
G1 X0 Y20
G1 X20 Y20
G1 X20 Y0
G1 X0 Y0
G1 X20 Y20
G1 X10 Y30
G1 X0 Y20
G1 X20 Y0
G0 Z10
`

describe('scaleGCode', () => {
  it('should not change G-code if no transform is defined', () => {
    let result = scaleGCode(gCode, 1)
    expect(result).toEqual(gCode)
    result = moveGCode(result, 0, 0)
    expect(result).toEqual(gCode)
  })

  it('should scale G-code', () => {
    const result = scaleGCode(gCode, 2)
    expect(result).toEqual(gCodeScalled)
  })

  it('should scale Home', () => {
    let result = scaleGCode(home, 1)
    expect(result).toEqual(home)
    result = moveGCode(result, 0, 0)
    expect(result).toEqual(home)
  })

  it('should scale and transform G-code', () => {
    let result = scaleGCode(gCode, 2)
    result = moveGCode(result, 10, 20)
    expect(result).toEqual(gCodeTransformed)
  })
})
