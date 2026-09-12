import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React, { useState } from 'react'

function StudentAttendanceForm({ onSubmit }: { onSubmit: (studentName: string, status: string) => void }) {
  const [studentName, setStudentName] = useState('')
  const [status, setStatus] = useState('present')

  return (
    <form
      aria-label="Haziri Attendance Form"
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit(studentName, status)
      }}
    >
      <div>
        <label htmlFor="student-input">Student Name</label>
        <input
          id="student-input"
          type="text"
          placeholder="e.g. Ali Khan"
          value={studentName}
          onChange={(e) => setStudentName(e.target.value)}
        />
      </div>

      <fieldset>
        <legend>Attendance Status</legend>
        <label>
          <input
            type="radio"
            name="status"
            value="present"
            checked={status === 'present'}
            onChange={() => setStatus('present')}
          />
          Present (Hazir)
        </label>
        <label>
          <input
            type="radio"
            name="status"
            value="absent"
            checked={status === 'absent'}
            onChange={() => setStatus('absent')}
          />
          Absent (Ghair Hazir)
        </label>
      </fieldset>

      <button type="submit">Submit Attendance</button>
    </form>
  )
}

describe('Testing Library Semantic DOM Locators', () => {
  it('finds accessible elements via role, label, and text without brittle class selectors', async () => {
    const user = userEvent.setup()
    let submittedData: { name: string; status: string } | null = null

    render(
      <StudentAttendanceForm
        onSubmit={(name, status) => {
          submittedData = { name, status }
        }}
      />
    )

    // 1. Semantic DOM locator by Form Role
    const form = screen.getByRole('form', { name: /haziri attendance form/i })
    expect(form).toBeInTheDocument()

    // 2. Semantic DOM locator by Label Text
    const nameInput = screen.getByLabelText(/student name/i)
    expect(nameInput).toBeInTheDocument()

    // 3. Semantic DOM locator by Placeholder Text
    const placeholderInput = screen.getByPlaceholderText('e.g. Ali Khan')
    expect(placeholderInput).toBe(nameInput)

    // 4. User Interaction
    await user.type(nameInput, 'Hamza Tariq')

    // 5. Semantic DOM locator by Radio Role
    const absentRadio = screen.getByRole('radio', { name: /absent \(ghair hazir\)/i })
    await user.click(absentRadio)

    // 6. Semantic DOM locator by Button Role
    const submitBtn = screen.getByRole('button', { name: /submit attendance/i })
    await user.click(submitBtn)

    expect(submittedData).toEqual({
      name: 'Hamza Tariq',
      status: 'absent',
    })
  })
})
