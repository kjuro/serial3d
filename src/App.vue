<template>
  <main class="container">
    <b-row>
      <h1 class="col">Serial 3D</h1>

      <b-button class="col-auto align-self-center" variant="primary" :disabled="serial.isClosing" @click="connect">
        {{ !serial.isOpen ? 'Connect' : 'Close connection' }}
      </b-button>

      <BFormTextarea v-model="input" class="col-12 mb-2" placeholder="Enter G-Code..." rows="10" />
    </b-row>

    <template v-if="serial.isOpen">
      <div class="row mb-3">
        <!--BButton @click="send('G28')" variant="primary" class="col-auto me-2" title="Home"><House /></BButton-->
        <BButton @click="send('G91\nG0 Z10')" variant="primary" class="col-auto me-2" title="Up"><ArrowUpFromLine /></BButton>
        <BButton @click="send('G91\nG0 Z-10')" variant="primary" class="col-auto me-2" title="Down"><ArrowDownToLine /></BButton>
        <BButton @click="send('G91\nG0 X-10')" variant="primary" class="col-auto me-2" title="Left"><ArrowLeft /></BButton>
        <BButton @click="send('G91\nG0 X10')" variant="primary" class="col-auto me-2" title="Right"><ArrowRight /></BButton>
        <BButton @click="send('G91\nG0 Y10')" variant="primary" class="col-auto me-2" title="Back"><ArrowUp /></BButton>
        <BButton @click="send('G91\nG0 Y-10')" variant="primary" class="col-auto me-2" title="Forward"><ArrowDown /></BButton>
        <BButton @click="send(input)" variant="primary" class="ms-auto col-auto"><SendHorizontal /> Send</BButton>
      </div>

      <div class="overflow-auto border row" style="height: 300px">
        <div v-for="(line, index) in output" :key="index">{{ line }}</div>
      </div>

      <b-row class="mt-2">
        <BButton @click="clear" variant="primary" class="col-auto"><CircleX /> Clear</BButton>
      </b-row>
    </template>

    <GCodeViewer :g-code="input" />
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import VueSerial from 'vue-serial'

import { ArrowUpFromLine, ArrowDownToLine, ArrowLeft, ArrowRight, ArrowUp, ArrowDown, SendHorizontal, CircleX } from 'lucide-vue-next'
import GCodeViewer from './components/GCodeViewer.vue'

// Data

const input = ref(`G0 X0 Y0 Z-10
G91 ; relative positioning
G1 X0 Y20
G1 X20 Y0
G1 X0 Y-20
G1 X-20 Y0
G1 X20 Y20
G1 X-10 Y10
G1 X-10 Y-10
G1 X20 Y-20
G0 Z10
`)

const output = ref<string[]>([]) // will contain the output of the serial port

let line = '' // will contain the line read from the serial port

// Configure the serial settings
const serial = new VueSerial()

serial.baudRate = 115200
serial.dataBits = 8
serial.stopBits = 1
serial.parity = 'none'
serial.bufferSize = 1024 // set to 1 to receive byte-per-byte
serial.flowControl = 'none'

// This will watch for incoming data
serial.addEventListener('read', (event) => {
  const decoder = new TextDecoder()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const value = decoder.decode((event as any).value)
  line += value

  const lines = line.split('\n')

  if (lines.length > 1) {
    for (let i = 0; i < lines.length - 1; i++) {
      console.log(lines[i])
      output.value.push(lines[i])
    }
    line = lines[lines.length - 1]
  }
})

// Methods

// Function to ask the user to select which serial device to connect
async function connect() {
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
  if (text) {
    const value = text + '\n' // add a newline to the value
    const encoder = new TextEncoder()
    const data = encoder.encode(value)
    await serial.write(data) // in your application, encapsulate in a try/catch to manage errors
    console.log('bytes sent:', value)
  }
}

function clear() {
  output.value = []
}
</script>

<style></style>
