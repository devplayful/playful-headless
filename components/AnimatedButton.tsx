'use client'

import { useRef, useState } from 'react'
import Lottie, { LottieRefCurrentProps } from 'lottie-react'

interface AnimatedButtonProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'success' | 'rocket'
  className?: string
  href?: string
}

export default function AnimatedButton({ 
  children, 
  onClick, 
  variant = 'primary', 
  className = '',
  href 
}: AnimatedButtonProps) {
  const lottieRef = useRef<LottieRefCurrentProps>(null)
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseEnter = () => {
    setIsHovered(true)
    if (lottieRef.current) {
      lottieRef.current.play()
    }
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
  }

  const handleClick = () => {
    if (lottieRef.current) {
      lottieRef.current.play()
    }
    if (onClick) {
      onClick()
    }
  }

  // Simple inline Lottie animations
  const getLottieAnimation = () => {
    switch (variant) {
      case 'primary':
        return {
          animationData: {
            "v": "5.7.4",
            "fr": 30,
            "ip": 0,
            "op": 30,
            "w": 24,
            "h": 24,
            "nm": "Arrow Right",
            "ddd": 0,
            "assets": [],
            "layers": [{
              "ddd": 0,
              "ind": 1,
              "ty": 4,
              "nm": "Arrow",
              "sr": 1,
              "ks": {
                "o": {"a": 0, "k": 100},
                "r": {"a": 0, "k": 0},
                "p": {"a": 1, "k": [{"i": {"x": 0.833, "y": 0.833}, "o": {"x": 0.167, "y": 0.167}, "t": 0, "s": [12, 12, 0]}, {"t": 30, "s": [18, 12, 0]}]},
                "a": {"a": 0, "k": [0, 0, 0]},
                "s": {"a": 0, "k": [100, 100, 100]}
              },
              "ao": 0,
              "shapes": [{
                "ty": "gr",
                "it": [{
                  "ind": 0,
                  "ty": "sh",
                  "ks": {
                    "a": 0,
                    "k": {
                      "i": [[0, 0], [0, 0], [0, 0]],
                      "o": [[0, 0], [0, 0], [0, 0]],
                      "v": [[-6, -3], [3, 0], [-6, 3]],
                      "c": false
                    }
                  }
                }, {
                  "ty": "st",
                  "c": {"a": 0, "k": [1, 1, 1, 1]},
                  "o": {"a": 0, "k": 100},
                  "w": {"a": 0, "k": 2},
                  "lc": 2,
                  "lj": 2
                }, {
                  "ty": "tr",
                  "p": {"a": 0, "k": [0, 0]},
                  "a": {"a": 0, "k": [0, 0]},
                  "s": {"a": 0, "k": [100, 100]},
                  "r": {"a": 0, "k": 0},
                  "o": {"a": 0, "k": 100}
                }]
              }],
              "ip": 0,
              "op": 30,
              "st": 0
            }]
          },
          size: 24
        }
      case 'rocket':
        return {
          animationData: {
            "v": "5.7.4",
            "fr": 30,
            "ip": 0,
            "op": 60,
            "w": 28,
            "h": 28,
            "nm": "Rocket",
            "ddd": 0,
            "assets": [],
            "layers": [{
              "ddd": 0,
              "ind": 1,
              "ty": 4,
              "nm": "Rocket",
              "sr": 1,
              "ks": {
                "o": {"a": 0, "k": 100},
                "r": {"a": 1, "k": [{"i": {"x": 0.833, "y": 0.833}, "o": {"x": 0.167, "y": 0.167}, "t": 0, "s": [0]}, {"t": 60, "s": [360]}]},
                "p": {"a": 1, "k": [{"i": {"x": 0.833, "y": 0.833}, "o": {"x": 0.167, "y": 0.167}, "t": 0, "s": [14, 14, 0]}, {"t": 30, "s": [14, 8, 0]}, {"t": 60, "s": [14, 14, 0]}]},
                "a": {"a": 0, "k": [0, 0, 0]},
                "s": {"a": 0, "k": [100, 100, 100]}
              },
              "ao": 0,
              "shapes": [{
                "ty": "gr",
                "it": [{
                  "ty": "el",
                  "s": {"a": 0, "k": [8, 12]},
                  "p": {"a": 0, "k": [0, 0]}
                }, {
                  "ty": "fl",
                  "c": {"a": 0, "k": [1, 1, 1, 1]},
                  "o": {"a": 0, "k": 100}
                }, {
                  "ty": "tr",
                  "p": {"a": 0, "k": [0, 0]},
                  "a": {"a": 0, "k": [0, 0]},
                  "s": {"a": 0, "k": [100, 100]},
                  "r": {"a": 0, "k": 0},
                  "o": {"a": 0, "k": 100}
                }]
              }],
              "ip": 0,
              "op": 60,
              "st": 0
            }]
          },
          size: 28
        }
      default:
        return {
          animationData: {
            "v": "5.7.4",
            "fr": 30,
            "ip": 0,
            "op": 30,
            "w": 24,
            "h": 24,
            "nm": "Arrow Right",
            "ddd": 0,
            "assets": [],
            "layers": [{
              "ddd": 0,
              "ind": 1,
              "ty": 4,
              "nm": "Arrow",
              "sr": 1,
              "ks": {
                "o": {"a": 0, "k": 100},
                "r": {"a": 0, "k": 0},
                "p": {"a": 1, "k": [{"i": {"x": 0.833, "y": 0.833}, "o": {"x": 0.167, "y": 0.167}, "t": 0, "s": [12, 12, 0]}, {"t": 30, "s": [18, 12, 0]}]},
                "a": {"a": 0, "k": [0, 0, 0]},
                "s": {"a": 0, "k": [100, 100, 100]}
              },
              "ao": 0,
              "shapes": [{
                "ty": "gr",
                "it": [{
                  "ind": 0,
                  "ty": "sh",
                  "ks": {
                    "a": 0,
                    "k": {
                      "i": [[0, 0], [0, 0], [0, 0]],
                      "o": [[0, 0], [0, 0], [0, 0]],
                      "v": [[-6, -3], [3, 0], [-6, 3]],
                      "c": false
                    }
                  }
                }, {
                  "ty": "st",
                  "c": {"a": 0, "k": [1, 1, 1, 1]},
                  "o": {"a": 0, "k": 100},
                  "w": {"a": 0, "k": 2},
                  "lc": 2,
                  "lj": 2
                }, {
                  "ty": "tr",
                  "p": {"a": 0, "k": [0, 0]},
                  "a": {"a": 0, "k": [0, 0]},
                  "s": {"a": 0, "k": [100, 100]},
                  "r": {"a": 0, "k": 0},
                  "o": {"a": 0, "k": 100}
                }]
              }],
              "ip": 0,
              "op": 30,
              "st": 0
            }]
          },
          size: 24
        }
    }
  }

  const getButtonStyles = () => {
    const baseStyles = "inline-flex items-center space-x-3 px-8 py-4 rounded-lg font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
    
    switch (variant) {
      case 'primary':
        return `${baseStyles} bg-teal-400 hover:bg-teal-500 text-white`
      case 'secondary':
        return `${baseStyles} bg-purple-600 hover:bg-purple-700 text-white`
      case 'success':
        return `${baseStyles} bg-green-500 hover:bg-green-600 text-white`
      case 'rocket':
        return `${baseStyles} bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white`
      default:
        return `${baseStyles} bg-teal-400 hover:bg-teal-500 text-white`
    }
  }

  const animation = getLottieAnimation()

  const buttonContent = (
    <>
      <span>{children}</span>
      <div className="w-6 h-6 flex items-center justify-center">
        <Lottie
          lottieRef={lottieRef}
          animationData={animation.animationData}
          style={{ width: animation.size, height: animation.size }}
          loop={false}
          autoplay={false}
        />
      </div>
    </>
  )

  if (href) {
    return (
      <a
        href={href}
        className={`${getButtonStyles()} ${className}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      >
        {buttonContent}
      </a>
    )
  }

  return (
    <button
      className={`${getButtonStyles()} ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      {buttonContent}
    </button>
  )
}
