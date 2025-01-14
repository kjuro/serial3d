<template>
  <main class="container">
    <h1>Serial 3D</h1>
    <div>
      <div>vue-serial: {{ serial.isOpen ? 'is open (device is ' + (serial.isConnected ? 'connected)' : 'disconnected)') : 'is closed' }}</div>
      <div v-if="serial.isOpen"><input ref="input" /><button :disabled="!serial.isConnected" @click="user_send">Send to device</button></div>
      <div>
        <button :disabled="serial.isClosing" @click="user_connect">{{ !serial.isOpen ? 'Connect to a device...' : 'Close connection' }}</button>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import VueSerial from 'vue-serial'

// Data

const input = ref() // input will contain the `<input ref="input">` element
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
    }
    line = lines[lines.length - 1]
  }
})

// Methods

// Function to ask the user to select which serial device to connect
async function user_connect() {
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
async function user_send() {
  const input_elt = input.value as HTMLInputElement // refers to <input ref="input">

  if (input_elt) {
    const value = input_elt.value + '\n' // add a newline to the value
    const encoder = new TextEncoder()
    const data = encoder.encode(value)
    await serial.write(data) // in your application, encapsulate in a try/catch to manage errors
    console.log('bytes sent:', value)
  }
}
</script>

<style></style>
