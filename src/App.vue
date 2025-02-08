<template>
  <main class="d-flex flex-column">
    <nav class="navbar bg-body-tertiary border-bottom">
      <div class="container-fluid">
        <div class="row col-auto mx-0">
          <b-button @click="openFile()" size="sm" title="Open G-Code file" class="col-auto me-1"><FolderOpen /></b-button>
          <b-button v-if="fileHandle" @click="saveFile()" size="sm" title="Save G-Code file" class="col-auto me-1"><Save /></b-button>
          <b-button @click="saveFile(true)" size="sm" title="Save as G-Code file" class="col-auto me-1"><SaveAll /></b-button>
          <b-button @click="onClear" size="sm" title="Clear G-Code" class="col-auto me-1"><CircleX /></b-button>

          <b-button v-if="printerSerial.isOpen" @click="send(code)" variant="primary" class="col-auto mx-1"><SendHorizontal /> Send</b-button>
        </div>

        <span class="navbar-brand col text-center">Serial Plotter / {{ position }}</span>

        <span v-if="isWaitingForOk" class="col-auto spinner-border text-danger" role="status">
          <span class="visually-hidden">Loading...</span>
        </span>

        <div class="row col-auto mx-0 ms-auto">
          <b-button
            class="col-auto"
            variant="primary"
            size="sm"
            :title="!printerSerial.isOpen ? 'Connect' : 'Close connection'"
            @click="connect(printerSerial)"
          >
            <Unplug v-if="printerSerial.isOpen" />
            <Plug v-else />
          </b-button>
        </div>
      </div>
    </nav>

    <article class="d-flex p-3 flex-grow-1">
      <div class="col pe-3">
        <BFormTextarea v-model="code" class="h-100" placeholder="Enter G-Code..." rows="10" />
      </div>

      <div class="col-auto">
        <GCodeViewer class="h-100" v-model="code" :X="X" :Y="Y" :Z="Z" :showMoves="showMoves" :showGrid="showGrid" @send="sendCode" @move="onMove" />
      </div>

      <div class="col-auto ps-3" style="width: 200px">
        <div>Scale</div>
        <div class="input-group">
          <b-form-input v-model="scale" class="text-end" />
          <span class="input-group-text">%</span>
        </div>

        <div>Offset X / Y</div>
        <div class="input-group mb-3">
          <b-form-input v-model="offsetX" class="text-end" />
          <b-form-input v-model="offsetY" class="text-end" />
          <span class="input-group-text">mm</span>
        </div>

        <b-button @click="convertGCode(false)" variant="secondary" class="w-100 mb-2">Revert</b-button>
        <b-button @click="convertGCode(true)" variant="primary" class="w-100">Convert</b-button>

        <b-row class="mt-3 mx-0">
          <div class="col-12 px-0">
            <div>X / Y</div>
            <div class="input-group mb-3">
              <b-form-input v-model="X" class="text-end" />
              <b-form-input v-model="Y" class="text-end" />
              <span class="input-group-text">mm</span>
            </div>
          </div>
        </b-row>

        <b-row class="mt-3 mx-0">
          <div class="col-12 px-0">
            <div>Unit</div>
            <div class="input-group mb-3">
              <b-form-input v-model="unit" class="text-end" />
              <span class="input-group-text">mm</span>
            </div>
          </div>
        </b-row>

        <b-row class="mb-3 justify-content-center">
          <div class="col-auto px-1">
            <b-button @click="move(X, Y, 0, true)" variant="primary" class="" title="Pen Up"><Pen /></b-button>
          </div>
          <div class="col-auto px-1">
            <b-button @click="move(X, Y, 10, true)" variant="primary" class="" title="Pen Down"><PenOff /></b-button>
          </div>
        </b-row>

        <b-row class="mb-3 justify-content-center">
          <div class="col-auto px-1">
            <b-button @click="move(0, 0, 1)" variant="primary" class="" title="Up"><ArrowUpFromLine /></b-button>
          </div>
          <div class="col-auto px-1">
            <b-button @click="move(0, 0, 10, true)" variant="primary" class="" title="Set [0, 0, 10]"><Circle /></b-button>
          </div>
          <div class="col-auto px-1">
            <b-button @click="move(0, 0, -1)" variant="primary" class="" title="Down"><ArrowDownToLine /></b-button>
          </div>
        </b-row>

        <b-row class="mb-2 justify-content-center">
          <div class="col-auto px-1">
            <b-button @click="move(-1, 1, 0)" variant="primary" class="" title="Up-Left"><ArrowUpLeft /></b-button>
          </div>
          <div class="col-auto px-1">
            <b-button @click="move(0, 1, 0)" variant="primary" class="" title="Up"><ArrowUp /></b-button>
          </div>
          <div class="col-auto px-1">
            <b-button @click="move(1, 1, 0)" variant="primary" class="" title="Up-Right"><ArrowUpRight /></b-button>
          </div>
        </b-row>
        <b-row class="mb-2 justify-content-center">
          <div class="col-auto px-1">
            <b-button @click="move(-1, 0, 0)" variant="primary" class="" title="Left"><ArrowLeft /></b-button>
          </div>
          <div class="col-auto px-1">
            <b-button @click="send(HOME)" variant="primary" class="" title="Home"><House /></b-button>
          </div>
          <div class="col-auto px-1">
            <b-button @click="move(1, 0, 0)" variant="primary" class="" title="Right"><ArrowRight /></b-button>
          </div>
        </b-row>
        <b-row class="justify-content-center">
          <div class="col-auto px-1">
            <b-button @click="move(-1, -1, 0)" variant="primary" class="" title="Down-Left"><ArrowDownLeft /></b-button>
          </div>
          <div class="col-auto px-1">
            <b-button @click="move(0, -1, 0)" variant="primary" class="" title="Down"><ArrowDown /></b-button>
          </div>
          <div class="col-auto px-1">
            <b-button @click="move(1, -1, 0)" variant="primary" class="" title="Down-Right"><ArrowDownRight /></b-button>
          </div>
        </b-row>

        <b-row class="mt-3">
          <div class="col-12">
            <BFormCheckbox v-model="sendToPlotter">Send to plotter</BFormCheckbox>
          </div>
          <div class="col-12">
            <BFormCheckbox v-model="showMoves">Show moves</BFormCheckbox>
          </div>
          <div class="col-12">
            <BFormCheckbox v-model="showGrid">Show grid</BFormCheckbox>
          </div>
          <div class="col-12">
            <BFormCheckbox v-model="addToCode">Add to G-Code</BFormCheckbox>
          </div>
        </b-row>
      </div>
    </article>
  </main>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import VueSerial from 'vue-serial'
import { useStorage } from '@vueuse/core'

import {
  House,
  ArrowUpFromLine,
  ArrowDownToLine,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  SendHorizontal,
  Circle,
  CircleX,
  FolderOpen,
  Save,
  SaveAll,
  Plug,
  Unplug,
  ArrowDownLeft,
  ArrowDownRight,
  ArrowUpLeft,
  ArrowUpRight,
  Pen,
  PenOff
} from 'lucide-vue-next'
import GCodeViewer from './components/GCodeViewer.vue'
import { scaleGCode, moveGCode, toFixed } from '@/utils/tools'

// Contants

const HOME = `G28 X Y
G90
G0 X15 Y35
G0 Z0
G92 X0 Y0 Z0
G0 Z10
M114
`

// Data

const scale = ref<number>(100) // Scale factor
const offsetX = ref<number>(0) // X offset
const offsetY = ref<number>(0) // Y offset

const moving = ref(false) // Head is moving
const fileHandle = ref() // File handle

const size = ref(200) // Plotter size

const X = ref(0) // X position
const Y = ref(0) // Y position
const Z = ref(10) // Z position

const sendToPlotter = useStorage('sendToPlotter', false)
const showMoves = useStorage('showMoves', false)
const showGrid = useStorage('showGrid', false)
const addToCode = useStorage('addToCode', false)

const unit = useStorage('unit', 10) // Unit in mm

const code = ref<string>(`G90 ; absolute positioning
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
`)

// Computed

const position = computed(() => `X: ${toFixed(X.value)} Y: ${toFixed(Y.value)} Z: ${toFixed(Z.value)}`)

// Serial

let line = '' // will contain the line read from the serial port

const queue: string[] = []
const isWaitingForOk = ref(false)

// Configure the serial settings
const printerSerial = new VueSerial()
setConfiguration(printerSerial)

printerSerial.addEventListener('read', (event) => {
  const decoder = new TextDecoder()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const value = decoder.decode((event as any).value)
  line += value

  const lines = line.split('\n')

  if (lines.length > 1) {
    for (let i = 0; i < lines.length - 1; i++) {
      const text = lines[i].trim()
      console.log('Plotter', text)
      if (text === 'ok') {
        isWaitingForOk.value = false
        processQueue()
      }

      if (text.startsWith('X:')) {
        // Parse text like X:0.00 Y:0.00 Z:10.00 E:0.00 Count X:1200 Y:2800 Z:149
        const regex = /X:(-?\d+\.\d+) Y:(-?\d+\.\d+) Z:(-?\d+\.\d+)/
        const match = text.match(regex)
        if (match) {
          X.value = parseFloat(match[1])
          Y.value = parseFloat(match[2])
          Z.value = parseFloat(match[3])

          moving.value = false
        }
      }
    }
    line = lines[lines.length - 1]
  }
})

// Methods

async function connect(serial: VueSerial) {
  if (serial.isOpen)
    await serial.close() // in your application, encapsulate in a try/catch to manage errors
  else {
    await serial.connect(undefined) // can be `serial.connect([{ usbVendorId:1027 }])` to show only FTDI devices
    if (serial.isOpen) {
      console.log('connected to', serial.usbVendorId, serial.usbProductId)
      //serial.startSignalsPolling(); // (optional) to listen for CTS, DCD, DSR, and RI signal events
      // await serial.write(...); // to send bytes to device automatically after connection
    }
  }
}

function sendCode(text: string) {
  if (sendToPlotter.value) {
    send(text)
  }
}
// Function to send the value contained in the input
async function send(text: string) {
  if (!printerSerial.isOpen) {
    return
  }

  if (text) {
    if (!text.endsWith('\n')) {
      text += '\n'
    }

    await text.split('\n').forEach((line) => queue.push(line))
    processQueue()
  }
}

// Function to process the queue
async function processQueue() {
  if (isWaitingForOk.value || queue.length === 0) {
    return
  }

  const value = queue.shift()
  if (value) {
    const encoder = new TextEncoder()
    const data = encoder.encode(value + '\n')
    isWaitingForOk.value = true

    if (value.startsWith('G0') || value.startsWith('G1')) {
      moving.value = true
    }

    await printerSerial.write(data)
    console.log('Sent:', value)
  }
}

function setConfiguration(serial: VueSerial) {
  serial.baudRate = 115200
  serial.dataBits = 8
  serial.stopBits = 1
  serial.parity = 'none'
  serial.bufferSize = 1024 // set to 1 to receive byte-per-byte
  serial.flowControl = 'none'
}

function openFile() {
  // Open file with file API
  // Open the file
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(window as any)
    .showOpenFilePicker({
      types: [
        {
          description: 'G-Code Files',
          accept: {
            'text/plain': ['.gcode', '.gco']
          }
        }
      ]
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .then((fileHandles: any[]) => {
      fileHandle.value = fileHandles[0]

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      fileHandle.value.getFile().then((file: any) => {
        // Read the file
        file.text().then((text: string) => {
          code.value = text
        })
      })
    })
}

async function saveFile(openDialog = false) {
  // Save file with file API
  const text = code.value
  if (openDialog || !fileHandle.value) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fileHandle.value = await (window as any).showSaveFilePicker({
      types: [
        {
          description: 'G-Code Files',
          accept: {
            'text/plain': ['.gcode', '.gco']
          }
        }
      ]
    })
  }

  const writable = await fileHandle.value.createWritable()
  await writable.write(text)
  await writable.close()

  console.log('Code was saved to: ' + fileHandle.value.name)
}

function convertGCode(convert: boolean) {
  if (convert) {
    const converted = scaleGCode(code.value, +scale.value / 100)
    code.value = moveGCode(converted, +offsetX.value, +offsetY.value)
  } else {
    // Revert
    const converted = moveGCode(code.value, -offsetX.value, -offsetY.value)
    code.value = scaleGCode(converted, 100 / +scale.value)
  }
}

const getCode = () => {
  return code.value ? code.value : 'G90 ; absolute positioning\nG0 X0 Y0 ; move to start position\n'
}

function move(x: number, y: number, z: number, absolute = false) {
  if (absolute) {
    X.value = x
    Y.value = y
    Z.value = z
  } else {
    X.value += x * unit.value
    Y.value += y * unit.value
    Z.value += z * unit.value
  }

  if (X.value < 0) {
    X.value = 0
  }

  if (Y.value < 0) {
    Y.value = 0
  }

  if (Z.value < 0) {
    Z.value = 0
  }

  if (X.value > size.value) {
    X.value = size.value
  }

  if (Y.value > size.value) {
    Y.value = size.value
  }

  if (Z.value > size.value) {
    Z.value = size.value
  }

  const command = Z.value === 0 ? 'G1' : 'G0'

  sendCode(absolute ? 'G90' : 'G91')
  if (absolute) {
    sendCode(`${command} X${toFixed(X.value)} Y${toFixed(Y.value)} Z${toFixed(Z.value)}\n`)
  } else {
    sendCode(`${command} X${toFixed(x * unit.value)} Y${toFixed(y * unit.value)} Z${toFixed(z * unit.value)}\n`)
  }
  sendCode(`${command}G90\nM114\n`)

  if (addToCode.value) {
    code.value = getCode() + `${command} X${toFixed(X.value)} Y${toFixed(Y.value)} Z${toFixed(Z.value)}\n`
  }
}

function onMove(pos: { x: number; y: number; z: number }) {
  move(pos.x, pos.y, pos.z, true)
}

function onClear() {
  code.value = ''
  fileHandle.value = ''
  X.value = 0
  Y.value = 0
  Z.value = 10
}
</script>

<style></style>
