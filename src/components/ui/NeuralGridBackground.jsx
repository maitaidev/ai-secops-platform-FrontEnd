import { useEffect, useRef } from "react"

// Фон логин-страницы: мелкая сетка + "нейроны", бегающие по её линиям.

const CELL = 36
const GRID_COLOR = "rgba(99, 102, 241, 0.07)"   // indigo-500, едва заметная
const NEURON_RGB = "129, 140, 248"               // indigo-400
const DIRS = [
  [1, 0], [-1, 0], [0, 1], [0, -1],
]

export default function NeuralGridBackground({ neuronCount = 22, className = "" }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    let cols, rows, raf, neurons

    function spawnNeuron() {
      const dir = DIRS[Math.floor(Math.random() * DIRS.length)]
      return {
        x: Math.floor(Math.random() * cols),
        y: Math.floor(Math.random() * rows),
        dir,
        progress: Math.random(),
        speed: 0.006 + Math.random() * 0.012,
        life: 0,
        maxLife: 250 + Math.random() * 350,
        trail: [],
      }
    }

    function resize() {
      const dpr = window.devicePixelRatio || 1
      canvas.width = canvas.offsetWidth * dpr
      canvas.height = canvas.offsetHeight * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      cols = Math.ceil(canvas.offsetWidth / CELL)
      rows = Math.ceil(canvas.offsetHeight / CELL)
    }

    function init() {
      resize()
      neurons = Array.from({ length: neuronCount }, spawnNeuron)
    }

    // на перекрёстке едем чаще прямо, иногда поворачиваем, не разворачиваясь
    function nextDir(x, y, dir) {
      const candidates = DIRS.filter(
        ([dx, dy]) => !(dx === -dir[0] && dy === -dir[1])
      ).filter(([dx, dy]) => {
        const nx = x + dx, ny = y + dy
        return nx >= 0 && nx < cols && ny >= 0 && ny < rows
      })
      if (candidates.length === 0) return [-dir[0], -dir[1]]
      if (Math.random() < 0.72) return dir
      return candidates[Math.floor(Math.random() * candidates.length)]
    }

    function drawGrid() {
      ctx.strokeStyle = GRID_COLOR
      ctx.lineWidth = 1
      ctx.beginPath()
      for (let i = 0; i <= cols; i++) {
        ctx.moveTo(i * CELL, 0)
        ctx.lineTo(i * CELL, rows * CELL)
      }
      for (let j = 0; j <= rows; j++) {
        ctx.moveTo(0, j * CELL)
        ctx.lineTo(cols * CELL, j * CELL)
      }
      ctx.stroke()
    }

    function drawNeuron(n) {
      const px = (n.x + n.dir[0] * n.progress) * CELL
      const py = (n.y + n.dir[1] * n.progress) * CELL

      n.trail.push({ x: px, y: py })
      if (n.trail.length > 12) n.trail.shift()

      n.trail.forEach((p, i) => {
        const alpha = (i / n.trail.length) * 0.3
        ctx.fillStyle = `rgba(${NEURON_RGB}, ${alpha})`
        ctx.beginPath()
        ctx.arc(p.x, p.y, 1.4, 0, Math.PI * 2)
        ctx.fill()
      })

      const glow = ctx.createRadialGradient(px, py, 0, px, py, 7)
      glow.addColorStop(0, `rgba(${NEURON_RGB}, 0.85)`)
      glow.addColorStop(1, `rgba(${NEURON_RGB}, 0)`)
      ctx.fillStyle = glow
      ctx.beginPath()
      ctx.arc(px, py, 7, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = `rgba(${NEURON_RGB}, 1)`
      ctx.beginPath()
      ctx.arc(px, py, 1.8, 0, Math.PI * 2)
      ctx.fill()
    }

    function tick() {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)
      drawGrid()

      neurons.forEach((n) => {
        n.progress += n.speed
        n.life += 1
        if (n.progress >= 1) {
          n.x += n.dir[0]
          n.y += n.dir[1]
          n.progress = 0
          n.dir = nextDir(n.x, n.y, n.dir)
        }
        drawNeuron(n)
      })

      neurons = neurons.map((n) => (n.life > n.maxLife ? spawnNeuron() : n))

      raf = requestAnimationFrame(tick)
    }

    init()
    tick()

    window.addEventListener("resize", init)
    return () => {
      window.removeEventListener("resize", init)
      cancelAnimationFrame(raf)
    }
  }, [neuronCount])

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
    />
  )
}
