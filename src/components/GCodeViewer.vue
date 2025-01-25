<template>
  <div>
    <svg
      class="g-code"
      :width="scale * size"
      :height="scale * size"
      :viewBox="`0 0 ${size} ${size}`"
      @mousedown="onMouseDown"
      @mousemove="onMouseMove"
      @mouseup="onMouseUp"
      :style="{ cursor: editable ? 'crosshair' : 'default' }"
    >
      <rect class="bed" x="0" y="0" :width="size" :height="size" />

      <g :transform="`scale(1, -1) translate(0, -${size})`">
        <path v-for="line of lines" :key="line.id" :class="line.class" :d="`M${line.x} ${line.y} l${line.dx} ${line.dy}`" />
      </g>
    </svg>

    <div v-if="editable" class="row mt-1">
      <div class="col-auto">
        <BFormCheckbox v-model="penDown" @update:model-value="onPenDown">Pen down</BFormCheckbox>
      </div>
      <div class="col-auto">
        <BFormCheckbox v-model="send">Send</BFormCheckbox>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useVModel } from '@vueuse/core'

type Line = {
  id: number
  class: 'move' | 'line'
  x: number
  y: number
  dx: number
  dy: number
}

// Properties

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  size: {
    type: Number,
    //default: 235
    default: 200
  },
  scale: {
    type: Number,
    default: 2.5
  },
  editable: {
    type: Boolean,
    default: true
  }
})

// Emits

const emit = defineEmits(['update:modelValue', 'send'])

// Data

const gCode = useVModel(props, 'modelValue', emit)

const isDragging = ref(false)
const penDown = ref(false)
const send = ref(false)

// Computed

const lines = computed<Line[]>(() => {
  const rows = gCode.value.split('\n')
  const lines: Line[] = []

  let lastX = 0
  let lastY = 0
  let id = 1
  let absolute = true

  for (let row of rows) {
    // Remove comments
    const commentIndex = row.indexOf(';')
    if (commentIndex !== -1) {
      row = row.slice(0, commentIndex)
    }

    row = row.trim()
    if (row === '') {
      continue
    }

    const [command, ...args] = row.split(' ')

    // Arguments start with a letter XYZ plus number. Store arguments in map

    const argsMap: Record<string, number> = {}
    for (const arg of args) {
      const letter = arg[0]
      const value = parseFloat(arg.slice(1))
      argsMap[letter] = value
    }

    if (command === 'G0' || command === 'G1') {
      let dx = argsMap.X
      let dy = argsMap.Y

      if (dx === undefined && dy === undefined) {
        continue
      }

      const x = lastX
      const y = lastY

      lastX = absolute ? (dx ?? x) : lastX + (dx ?? 0)
      lastY = absolute ? (dy ?? y) : lastY + (dy ?? 0)

      if (absolute) {
        dx = (dx ?? x) - x
        dy = (dy ?? y) - y
      }

      lines.push({ id: id++, class: command === 'G0' ? 'move' : 'line', x, y, dx, dy })
    } else if (command === 'G90') {
      absolute = true
    } else if (command === 'G91') {
      absolute = false
    }
  }

  return lines
})

// Methods

const getCode = () => {
  return gCode.value ? gCode.value : 'G90 ; absolute positioning\nG0 X0 Y0 ; move to start position\n'
}

const sendCode = (code: string) => {
  if (send.value) {
    emit('send', code)
  }
}

const onPenDown = (down: boolean) => {
  const code = down ? 'G1 Z0\n' : 'G0 Z10\n'
  sendCode(code)
  gCode.value = getCode() + code
}

const onMouseDown = (event: MouseEvent) => {
  if (!props.editable) return

  const svgElement = event.currentTarget as SVGElement
  const rect = svgElement.getBoundingClientRect()
  const x = (event.clientX - rect.left) / props.scale
  const y = (rect.height - (event.clientY - rect.top)) / props.scale

  isDragging.value = true

  let code = ''

  if (penDown.value) {
    code = `G1 X${x} Y${y}\n`
  } else {
    code = `G0 X${x} Y${y}\n`
  }

  sendCode(code)
  gCode.value = getCode() + code
}

const onMouseMove = (event: MouseEvent) => {
  if (!isDragging.value) return

  const svgElement = event.currentTarget as SVGElement
  const rect = svgElement.getBoundingClientRect()
  const x = (event.clientX - rect.left) / props.scale
  const y = (rect.height - (event.clientY - rect.top)) / props.scale

  // Handle the move logic here
  console.log(`Moving: x=${x}, y=${y}`)
}

const onMouseUp = () => {
  isDragging.value = false
}
</script>

<style>
svg.g-code {
  stroke: black;
  fill: none;
}

svg.g-code .bed {
  stroke: blue !important;
}

svg.g-code .move {
  stroke: green !important;
  vector-effect: non-scaling-stroke;
}
</style>
