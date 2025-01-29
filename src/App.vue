<template>
  <main class="d-flex flex-column">
    <nav class="navbar bg-body-tertiary border-bottom">
      <div class="container-fluid">
        <div class="row col-auto mx-0">
          <b-button @click="openFile()" size="sm" title="Open G-Code file" class="col-auto me-1"><FolderOpen /></b-button>
          <b-button v-if="fileHandle" @click="saveFile()" size="sm" title="Save G-Code file" class="col-auto me-1"><Save /></b-button>
          <b-button @click="saveFile(true)" size="sm" title="Save as G-Code file" class="col-auto me-1"><SaveAll /></b-button>
          <b-button @click="(code = ''), (fileHandle = '')" size="sm" title="Clear G-Code" class="col-auto me-1"><CircleX /></b-button>

          <b-button v-if="printerSerial.isOpen" @click="send(code)" variant="primary" class="col-auto mx-1"><SendHorizontal /> Send</b-button>
        </div>

        <span class="navbar-brand col text-center">Serial Plotter [{{ X }}, {{ Y }}, {{ Z }}]</span>

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
        <GCodeViewer class="h-100" v-model="code" @send="send" />
      </div>

      <div class="col-auto ps-3">
        <div>Scale</div>
        <b-form-input v-model="scale" type="number" min="0.1" step="0.1" class="text-end mb-2" />
        <div>Offset X</div>
        <b-form-input v-model="offsetX" type="number" class="text-end mb-2" />
        <div>Offset Y</div>
        <b-form-input v-model="offsetY" type="number" class="text-end mb-2" />
        <b-button @click="convertGCode(false)" variant="secondary" class="w-100 mb-2">Revert</b-button>
        <b-button @click="convertGCode(true)" variant="primary" class="w-100">Convert</b-button>

        <b-row class="mt-3">
          <div class="col-12 mb-2 px-1">
            <b-form-select v-model="unit" :options="unitOptions" />
          </div>
        </b-row>

        <b-row class="mb-3 justify-content-center">
          <div class="col-auto px-1">
            <b-button @click="move(0, 0, 1)" variant="primary" class="" title="Up"><ArrowUpFromLine /></b-button>
          </div>
          <div class="col-auto px-1">
            <b-button @click="send('G92 X0 Y0 Z10\nM114\n')" variant="primary" class="" title="Set [0, 0, 10]"><Circle /></b-button>
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
      </div>
    </article>
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import VueSerial from 'vue-serial'

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
  ArrowUpRight
} from 'lucide-vue-next'
import GCodeViewer from './components/GCodeViewer.vue'
import { scaleGCode, moveGCode } from '@/utils/tools'

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

const scale = ref<number>(1) // Scale factor
const offsetX = ref<number>(0) // X offset
const offsetY = ref<number>(0) // Y offset

const moving = ref(false) // Head is moving
const fileHandle = ref() // File handle

const X = ref(0) // X position
const Y = ref(0) // Y position
const Z = ref(0) // Z position

const unit = ref(10) // Unit v mm

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

// Constants

const unitOptions = [
  { value: 0.1, text: '0.1 mm' },
  { value: 0.5, text: '0.5 mm' },
  { value: 1, text: '1 mm' },
  { value: 5, text: '5 mm' },
  { value: 10, text: '10 mm' }
]

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
    const converted = scaleGCode(code.value, +scale.value)
    code.value = moveGCode(converted, +offsetX.value, +offsetY.value)
  } else {
    // Revert
    const converted = moveGCode(code.value, -offsetX.value, -offsetY.value)
    code.value = scaleGCode(converted, 1 / +scale.value)
  }
}

function move(x: number, y: number, z: number) {
  send(`G91\nG0 X${x * unit.value} Y${y * unit.value} Z${z * unit.value}\nG90\nM114\n`)
}
</script>

<style></style>
