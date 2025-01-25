<template>
  <main class="container">
    <b-row>
      <h1 class="col">
        Serial 3D [{{ X }}, {{ Y }}, {{ Z }}]
        <div v-if="isWaitingForOk" class="spinner-border text-danger" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </h1>

      <b-button class="col-auto align-self-center" variant="primary" :disabled="printerSerial.isClosing" @click="connect(printerSerial)">
        {{ !printerSerial.isOpen ? 'Connect' : 'Close connection' }}
      </b-button>
    </b-row>

    <b-row class="mb-2">
      <div class="col">
        <div class="mb-1">
          <BButton @click="openFile()" size="sm" title="Open G-Code file" class="me-1"><FolderOpen /></BButton>
          <BButton v-if="fileHandle" @click="saveFile()" size="sm" title="Save G-Code file" class="me-1"><Save /></BButton>
          <BButton @click="saveFile(true)" size="sm" title="Save as G-Code file" class="me-1"><SaveAll /></BButton>
          <BButton @click="(code = ''), (fileHandle = '')" size="sm" title="Clear G-Code" class="me-1"><CircleX /></BButton>
        </div>
        <BFormTextarea v-model="code" class="col" placeholder="Enter G-Code..." rows="10" />
      </div>

      <div class="col-auto" style="width: 130px">
        <div>Scale</div>
        <BFormInput v-model="scale" type="number" min="0.1" step="0.1" class="text-end mb-2" />
        <div>Offset X</div>
        <BFormInput v-model="offsetX" type="number" class="text-end mb-2" />
        <div>Offset Y</div>
        <BFormInput v-model="offsetY" type="number" class="text-end mb-2" />
        <BButton @click="convertGCode(false)" variant="secondary" class="w-100 mb-2">Revert</BButton>
        <BButton @click="convertGCode(true)" variant="primary" class="w-100">Convert</BButton>
      </div>
    </b-row>

    <b-row v-if="printerSerial.isOpen" class="mb-2">
      <div class="col-6 px-0">
        <BButton @click="send(code)" variant="primary"><SendHorizontal /> Send</BButton>
      </div>
    </b-row>

    <b-row class="mt-3">
      <div class="col">
        <GCodeViewer v-model="code" @send="send" />
      </div>

      <div v-if="printerSerial.isOpen" class="col-auto" style="width: 130px">
        <b-row>
          <div class="col-6 mb-2 px-1">
            <BButton @click="send('G91\nG0 Z5\nM114')" variant="primary" class="w-100" title="Up"><ArrowUpFromLine /></BButton>
          </div>
          <div class="col-6 mb-2 px-1">
            <BButton @click="send('G91\nG0 Z-5\nM114')" variant="primary" class="w-100" title="Down"><ArrowDownToLine /></BButton>
          </div>
          <div class="col-6 mb-2 px-1">
            <BButton @click="send('G91\nG0 X-10\nM114')" variant="primary" class="w-100" title="Left"><ArrowLeft /></BButton>
          </div>
          <div class="col-6 mb-2 px-1">
            <BButton @click="send('G91\nG0 X10\nM114')" variant="primary" class="w-100" title="Right"><ArrowRight /></BButton>
          </div>
          <div class="col-6 mb-2 px-1">
            <BButton @click="send('G91\nG0 Y10\nM114')" variant="primary" class="w-100" title="Back"><ArrowUp /></BButton>
          </div>
          <div class="col-6 mb-2 px-1">
            <BButton @click="send('G91\nG0 Y-10\nM114')" variant="primary" class="w-100" title="Forward"><ArrowDown /></BButton>
          </div>
          <div class="col-6 mb-2 px-1">
            <BButton @click="send(HOME)" variant="primary" class="w-100" title="Home"><House /></BButton>
          </div>
          <div class="col-6 mb-2 px-1">
            <BButton @click="send('G92 X0 Y0 Z10\nM114')" variant="primary" class="w-100" title="Set [0, 0, 10]"><Circle /></BButton>
          </div>
        </b-row>
      </div>
    </b-row>
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
  SaveAll
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
M114`

// Data

const scale = ref<number>(1) // Scale factor
const offsetX = ref<number>(0) // X offset
const offsetY = ref<number>(0) // Y offset

const moving = ref(false) // Head is moving
const fileHandle = ref() // File handle

const X = ref(0) // X position
const Y = ref(0) // Y position
const Z = ref(0) // Z position

const code = ref(`G90 ; absolute positioning
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
</script>

<style></style>
