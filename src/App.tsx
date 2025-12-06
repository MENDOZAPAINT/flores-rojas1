import { useEffect, useMemo, useRef, useState, memo } from 'react'
import { gsap } from 'gsap'
import { Flower, Flower2, Cherry, Leaf, Sparkles } from 'lucide-react'
import './App.css'
import audioFile from './assets/Bad.mp3'

// Componente memoizado y estable (fuera de App) para evitar remounts y parpadeos
const HeartsOverlay = memo(() => {
  const hearts = useMemo(() => {
    // Mezcla de iconos SVG y texto
    type ItemType =
      | { type: 'component'; Component: React.ComponentType<{ size: number; strokeWidth: number }> }
      | { type: 'text'; text: string }

    const items: ItemType[] = [
      { type: 'component', Component: Flower },
      { type: 'component', Component: Flower2 },
      { type: 'component', Component: Cherry },
      { type: 'text', text: 'Dannia' },
      { type: 'component', Component: Leaf },
      { type: 'component', Component: Sparkles },
    ]

    return Array.from({ length: 36 }).map((_, idx) => {
      const left = Math.random() * 100
      const size = 16 + Math.random() * 28
      const duration = 10 + Math.random() * 12
      const delay = Math.random() * 8
      const item = items[idx % items.length]

      return {
        id: `heart-${idx}-${Math.random().toString(36).slice(2, 7)}`,
        style: {
          left: `${left}%`,
          animationDuration: `${duration}s`,
          animationDelay: `${delay}s`,
        },
        size,
        item,
      }
    })
  }, [])

  return (
    <>
      <style>{`
        .hearts-container { position: fixed; inset: 0; pointer-events: none; overflow: hidden; z-index: 1; }
        .heart { position: absolute; bottom: -10vh; will-change: transform, opacity; transform: translateZ(0); animation-name: float-up; animation-timing-function: linear; animation-iteration-count: infinite; color: #ff6b9d; filter: drop-shadow(0 0 8px rgba(255, 107, 157, 0.6)); }
        .heart-text { font-family: 'Georgia', serif; font-weight: 600; text-shadow: 0 0 10px rgba(255, 107, 157, 0.8); }
        @keyframes float-up {
          0% { transform: translateY(0) scale(1) rotate(0deg); opacity: 0; }
          10% { opacity: 0.9; }
          100% { transform: translateY(-120vh) scale(1.2) rotate(360deg); opacity: 0; }
        }
      `}</style>
      <div className="hearts-container" aria-hidden="true">
        {hearts.map((h) => (
          <div key={h.id} className="heart" style={h.style}>
            {h.item.type === 'component' ? (
              <h.item.Component size={h.size} strokeWidth={1.5} />
            ) : (
              <span className="heart-text" style={{ fontSize: `${h.size}px` }}>
                {h.item.text}
              </span>
            )}
          </div>
        ))}
      </div>
    </>
  )
})

function App() {
  const leftTextRef = useRef<HTMLParagraphElement>(null)
  const rightTextRef = useRef<HTMLParagraphElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const sparklesRef = useRef<HTMLDivElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const lastTimeUpdateRef = useRef(0)

  // Estados para el reproductor personalizado
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)

  const flowerConfigs = [
    { id: 1, leafsVariant: 1, lineLeafCount: 6 },
    { id: 2, leafsVariant: 2, lineLeafCount: 4 },
    { id: 3, leafsVariant: 3, lineLeafCount: 4 },
    { id: 4, leafsVariant: 4, lineLeafCount: 5 },
    { id: 5, leafsVariant: 3, lineLeafCount: 5 },
    { id: 6, leafsVariant: 2, lineLeafCount: 5 },
    { id: 7, leafsVariant: 1, lineLeafCount: 4 },
    { id: 8, leafsVariant: 4, lineLeafCount: 6 },
    { id: 9, leafsVariant: 2, lineLeafCount: 5 },
    { id: 10, leafsVariant: 3, lineLeafCount: 6 },
    { id: 11, leafsVariant: 1, lineLeafCount: 4 },
    { id: 12, leafsVariant: 4, lineLeafCount: 5 },
  ];

  // Helper to generate [1..n]
  const range = (n: number) => Array.from({ length: n }, (_, i) => i + 1);

  // Funciones del reproductor personalizado
  const togglePlayPause = () => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
    } else {
      audio.play()
        .then(() => setIsPlaying(true))
        .catch(console.error)
    }
  }

  const handleTimeUpdate = () => {
    const now = performance.now()
    if (audioRef.current) {
      if (now - lastTimeUpdateRef.current > 200) { // ~5 veces por segundo
        setCurrentTime(audioRef.current.currentTime)
        lastTimeUpdateRef.current = now
      }
    }
  }

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration)
    }
  }

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (audioRef.current) {
      const rect = e.currentTarget.getBoundingClientRect()
      const clickX = e.clientX - rect.left
      const newTime = (clickX / rect.width) * duration
      audioRef.current.currentTime = newTime
      setCurrentTime(newTime)
    }
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
    if (audioRef.current) {
      audioRef.current.volume = newVolume
    }
  }

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  // Typewriter effect with GSAP
  useEffect(() => {
    const leftText = ""
    const rightText = ""

    // Clear initial text
    if (leftTextRef.current) leftTextRef.current.textContent = ""
    if (rightTextRef.current) rightTextRef.current.textContent = ""

    // Create typewriter effect function
    const typeWriter = (element: HTMLElement, text: string, delay: number) => {
      let currentText = ""
      const chars = text.split("")

      chars.forEach((char, index) => {
        gsap.delayedCall(delay + (index * 0.09), () => {
          currentText += char
          element.textContent = currentText
        })
      })
    }

    // Heartbeat animation for the title
    if (titleRef.current) {
      const tl = gsap.timeline()

      // Initial state
      gsap.set(titleRef.current, {
        opacity: 0,
        scale: 0.5,
      })

      // Fade in
      tl.to(titleRef.current, {
        delay: 0.5,
        duration: 1,
        opacity: 1,
        scale: 1,
        ease: "power2.out"
      })

        // Heartbeat animation - realistic double beat pattern (lub-dub)
        .to(titleRef.current, {
          delay: 0.5,
          duration: 0.15,
          scale: 1.3,
          textShadow: "0 0 30px rgba(255, 0, 0, 1), 0 0 60px rgba(255, 0, 0, 0.8), 0 0 90px rgba(255, 0, 0, 0.6)",
          ease: "power2.out"
        })
        .to(titleRef.current, {
          duration: 0.15,
          scale: 1,
          textShadow: "0 0 20px rgba(255, 0, 0, 0.8), 0 0 40px rgba(255, 0, 0, 0.6), 0 0 60px rgba(255, 0, 0, 0.4)",
          ease: "power2.in"
        })
        // Second beat (dub)
        .to(titleRef.current, {
          duration: 0.15,
          scale: 1.25,
          textShadow: "0 0 30px rgba(255, 0, 0, 1), 0 0 60px rgba(255, 0, 0, 0.8), 0 0 90px rgba(255, 0, 0, 0.6)",
          ease: "power2.out"
        })
        .to(titleRef.current, {
          duration: 0.15,
          scale: 1,
          textShadow: "0 0 20px rgba(255, 0, 0, 0.8), 0 0 40px rgba(255, 0, 0, 0.6), 0 0 60px rgba(255, 0, 0, 0.4)",
          ease: "power2.in"
        })
        // Pause between heartbeats
        .to(titleRef.current, {
          duration: 0.4,
          scale: 1,
          textShadow: "0 0 15px rgba(255, 0, 0, 0.6), 0 0 30px rgba(255, 0, 0, 0.4), 0 0 45px rgba(255, 0, 0, 0.2)",
        })
        // Repeat the heartbeat infinitely
        .call(() => {
          gsap.to(titleRef.current, {
            duration: 0.15,
            scale: 1.3,
            textShadow: "0 0 30px rgba(255, 0, 0, 1), 0 0 60px rgba(255, 0, 0, 0.8), 0 0 90px rgba(255, 0, 0, 0.6)",
            ease: "power2.out",
            yoyo: true,
            repeat: 1,
            repeatDelay: 0,
            onComplete: () => {
              gsap.to(titleRef.current, {
                duration: 0.4,
                scale: 1,
                textShadow: "0 0 15px rgba(255, 0, 0, 0.6), 0 0 30px rgba(255, 0, 0, 0.4), 0 0 45px rgba(255, 0, 0, 0.2)",
                ease: "power2.inOut",
                delay: 0,
                onComplete: () => {
                  // Recursively call the heartbeat
                  const heartbeat = () => {
                    gsap.to(titleRef.current, {
                      duration: 0.15,
                      scale: 1.3,
                      textShadow: "0 0 30px rgba(255, 0, 0, 1), 0 0 60px rgba(255, 0, 0, 0.8), 0 0 90px rgba(255, 0, 0, 0.6)",
                      ease: "power2.out",
                      yoyo: true,
                      repeat: 1,
                      repeatDelay: 0,
                      onComplete: () => {
                        gsap.to(titleRef.current, {
                          duration: 0.4,
                          scale: 1,
                          textShadow: "0 0 15px rgba(255, 0, 0, 0.6), 0 0 30px rgba(255, 0, 0, 0.4), 0 0 45px rgba(255, 0, 0, 0.2)",
                          ease: "power2.inOut",
                          delay: 0.4,
                          onComplete: heartbeat
                        })
                      }
                    })
                  }
                  heartbeat()
                }
              })
            }
          })
        })
    }

    // Calculate duration for left text
    const leftTextDuration = leftText.length * 0.09 // 0.09 seconds per character
    const leftStartDelay = 4.5 // Increased delay to start after title animation completes
    const rightStartDelay = leftStartDelay + leftTextDuration // Right text starts after left text completes

    // Start typewriter animations sequentially
    if (leftTextRef.current) {
      typeWriter(leftTextRef.current, leftText, leftStartDelay)
    }

    if (rightTextRef.current) {
      typeWriter(rightTextRef.current, rightText, rightStartDelay)
    }

  }, [])

  // Auto-play del audio
  useEffect(() => {
    const initializeAudio = () => {
      if (audioRef.current) {
        // Configurar el audio
        audioRef.current.volume = volume
        audioRef.current.muted = isMuted

        return
      }
    }

    // Delay para asegurar que el DOM esté listo
    const timer = setTimeout(initializeAudio, 500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <>
      <div className="night" ></div>
      <h1 className="main-title" ref={titleRef}>❤️</h1>
      {/* Múltiples corazones que se mueven */}
      <HeartsOverlay />

      {/* Sparkle particles container */}
      <div ref={sparklesRef} style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
        zIndex: 999
      }}></div>

      {/* Side text elements */}
      <div className="side-text side-text--left">
        <p ref={leftTextRef}></p>
      </div>

      <div className="side-text side-text--right">
        <p ref={rightTextRef}></p>
      </div>

      {/* Reproductor de audio completamente personalizado */}
      <div className="custom-audio-player">
        <audio
          ref={audioRef}
          src={audioFile}
          muted={isMuted}
          preload="auto"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => {
            // Cuando termina de reproducirse, pausar el audio
            setIsPlaying(false)
          }}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          style={{ display: 'none' }}
        />

        <div className="audio-controls">
          <button className="play-pause-btn" onClick={togglePlayPause}>
            {isPlaying ? (
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          <div className="time-display">
            {formatTime(currentTime)}
          </div>

          <div className="progress-container" onClick={handleProgressClick}>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
              />
            </div>
          </div>

          <div className="time-display">
            {formatTime(duration)}
          </div>

          <button className="mute-btn" onClick={toggleMute}>
            {isMuted ? (
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 = 13 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 = 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
              </svg>
            )}
          </button>

          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
            className="volume-slider"
          />
        </div>
      </div>

      <div className="flowers">
        {flowerConfigs.map(({ id, leafsVariant, lineLeafCount }) => (
          <div className={`flower flower--${id}`} key={id}>
            <div className={`flower__leafs flower__leafs--${leafsVariant}`}>
              <div className="flower__leaf flower__leaf--1"></div>
              <div className="flower__leaf flower__leaf--2"></div>
              <div className="flower__leaf flower__leaf--3"></div>
              <div className="flower__leaf flower__leaf--4"></div>
              <div className="flower__white-circle"></div>
            </div>
            <div className="flower__line">
              {range(lineLeafCount).map((i) => (
                <div key={`line-leaf-${id}-${i}`} className={`flower__line__leaf flower__line__leaf--${i}`}></div>
              ))}
            </div>
          </div>
        ))}



      </div>
    </>
  )
}

export default App
