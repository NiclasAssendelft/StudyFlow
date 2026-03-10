'use client'

import { useState } from 'react'

interface MathCalculatorProps {
  onUseResult: (value: string) => void
  lang: 'fi' | 'sv'
  onClose: () => void
}

export function MathCalculator({ onUseResult, lang, onClose }: MathCalculatorProps) {
  const [expression, setExpression] = useState('')
  const [result, setResult] = useState('')

  const handleButton = (value: string) => {
    if (value === 'C') {
      setExpression('')
      setResult('')
    } else if (value === '⌫') {
      setExpression((prev) => prev.slice(0, -1))
    } else if (value === '=') {
      try {
        // Safe math evaluation
        const sanitized = expression
          .replace(/×/g, '*')
          .replace(/÷/g, '/')
          .replace(/π/g, String(Math.PI))
          .replace(/e(?![0-9])/g, String(Math.E))
          .replace(/√\(([^)]+)\)/g, 'Math.sqrt($1)')
          .replace(/\^/g, '**')
        const evalResult = Function('"use strict"; return (' + sanitized + ')')()
        const formatted = typeof evalResult === 'number'
          ? (Number.isInteger(evalResult) ? evalResult.toString() : evalResult.toFixed(4).replace(/\.?0+$/, ''))
          : String(evalResult)
        setResult(formatted)
      } catch {
        setResult(lang === 'sv' ? 'Fel' : 'Virhe')
      }
    } else {
      setExpression((prev) => prev + value)
    }
  }

  const buttons = [
    ['C', '⌫', '(', ')'],
    ['7', '8', '9', '÷'],
    ['4', '5', '6', '×'],
    ['1', '2', '3', '-'],
    ['0', '.', '^', '+'],
    ['π', 'e', '√(', '='],
  ]

  return (
    <div className="bg-white border rounded-xl shadow-lg p-4 w-72">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-700">
          🧮 {lang === 'sv' ? 'Miniräknare' : 'Laskin'}
        </span>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg">×</button>
      </div>

      {/* Display */}
      <div className="bg-gray-50 rounded-lg p-3 mb-3 font-mono">
        <div className="text-sm text-gray-500 min-h-[20px] break-all">{expression || '0'}</div>
        {result && (
          <div className="text-xl font-bold text-gray-900 mt-1">= {result}</div>
        )}
      </div>

      {/* Buttons */}
      <div className="grid grid-cols-4 gap-1.5 mb-3">
        {buttons.flat().map((btn, i) => (
          <button
            key={i}
            onClick={() => handleButton(btn)}
            className={`p-2.5 rounded-lg text-sm font-medium transition-colors ${
              btn === '='
                ? 'bg-brand-600 text-white hover:bg-brand-700'
                : btn === 'C'
                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {btn}
          </button>
        ))}
      </div>

      {/* Use result */}
      {result && result !== (lang === 'sv' ? 'Fel' : 'Virhe') && (
        <button
          onClick={() => onUseResult(result)}
          className="w-full bg-green-50 text-green-700 border border-green-200 py-2 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors"
        >
          {lang === 'sv' ? 'Använd som svar' : 'Käytä vastauksena'} ({result})
        </button>
      )}
    </div>
  )
}
