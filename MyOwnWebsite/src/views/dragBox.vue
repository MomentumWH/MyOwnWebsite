<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const isDragging = ref(false)
const position = ref({ x: 100, y: 100 })
const offset = ref({ x: 0, y: 0 })

const handleMouseDown = (e: MouseEvent) => {
  isDragging.value = true
  offset.value = {
    x: e.clientX - position.value.x,
    y: e.clientY - position.value.y
  }
}

const handleMouseMove = (e: MouseEvent) => {
  if (!isDragging.value) return
  
  position.value = {
    x: e.clientX - offset.value.x,
    y: e.clientY - offset.value.y
  }
}

const handleMouseUp = () => {
  isDragging.value = false
}

onMounted(() => {
  window.addEventListener('mousemove', handleMouseMove)
  window.addEventListener('mouseup', handleMouseUp)
})

onUnmounted(() => {
  window.removeEventListener('mousemove', handleMouseMove)
  window.removeEventListener('mouseup', handleMouseUp)
})
</script>

<template>
  <div class="drag-container">
    <div
      class="drag-box"
      :style="{ left: `${position.x}px`, top: `${position.y}px` }"
      @mousedown="handleMouseDown"
    >
      <div class="drag-content">
        <h2>拖动盒子</h2>
        <p>点击并拖动我！</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.drag-container {
  width: 100%;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #8a5ab9 100%);
  position: relative;
  overflow: hidden;
}

.drag-box {
  position: absolute;
  width: 300px;
  height: 200px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  cursor: move;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.drag-box:hover {
  transform: scale(1.02);
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.3);
}

.drag-box:active {
  transform: scale(0.98);
  cursor: grabbing;
}

.drag-content {
  padding: 2rem;
  text-align: center;
  color: #333;
}

.drag-content h2 {
  margin-bottom: 1rem;
  font-size: 1.5rem;
  color: #667eea;
}

.drag-content p {
  font-size: 1rem;
  color: #666;
}
</style>
