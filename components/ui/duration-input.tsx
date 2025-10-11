'use client'

import React from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface DurationInputProps {
  value: number | null // in seconds
  onChange: (seconds: number | null) => void
  label?: string
  disabled?: boolean
}

export function DurationInput({ value, onChange, label = "Duration", disabled = false }: DurationInputProps) {
  const hours = value ? Math.floor(value / 3600) : 0
  const minutes = value ? Math.floor((value % 3600) / 60) : 0
  const seconds = value ? value % 60 : 0

  const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHours = parseInt(e.target.value) || 0
    const newMinutes = minutes
    const newSeconds = seconds
    const totalSeconds = newHours * 3600 + newMinutes * 60 + newSeconds
    onChange(totalSeconds > 0 ? totalSeconds : null)
  }

  const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMinutes = parseInt(e.target.value) || 0
    const newHours = hours
    const newSeconds = seconds
    const totalSeconds = newHours * 3600 + newMinutes * 60 + newSeconds
    onChange(totalSeconds > 0 ? totalSeconds : null)
  }

  const handleSecondsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSeconds = parseInt(e.target.value) || 0
    const newHours = hours
    const newMinutes = minutes
    const totalSeconds = newHours * 3600 + newMinutes * 60 + newSeconds
    onChange(totalSeconds > 0 ? totalSeconds : null)
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex space-x-2">
        <div className="flex-1">
          <Input
            type="number"
            min="0"
            max="23"
            value={hours}
            onChange={handleHoursChange}
            placeholder="0"
            className="text-center"
            disabled={disabled}
          />
          <p className="text-xs text-gray-500 text-center mt-1">Hours</p>
        </div>
        <div className="flex-1">
          <Input
            type="number"
            min="0"
            max="59"
            value={minutes}
            onChange={handleMinutesChange}
            placeholder="0"
            className="text-center"
            disabled={disabled}
          />
          <p className="text-xs text-gray-500 text-center mt-1">Minutes</p>
        </div>
        <div className="flex-1">
          <Input
            type="number"
            min="0"
            max="59"
            value={seconds}
            onChange={handleSecondsChange}
            placeholder="0"
            className="text-center"
            disabled={disabled}
          />
          <p className="text-xs text-gray-500 text-center mt-1">Seconds</p>
        </div>
      </div>
    </div>
  )
}
