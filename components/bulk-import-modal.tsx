'use client'

import { useRef, useState } from 'react'
import Papa from 'papaparse'
import { AlertCircle, Check, Copy, Download, FileSpreadsheet, Loader2, Upload, X } from 'lucide-react'
import { bulkUploadStudentsAction, type GeneratedParentCredential } from '@/app/actions/students'

export const CSV_HEADER_KEYS = [
  'roll_number',
  'student_name',
  'grade',
  'parent_name',
  'parent_phone',
  'parent_email',
] as const

export type CsvHeaderKey = (typeof CSV_HEADER_KEYS)[number]
export type MappedStudentRow = Record<CsvHeaderKey, string>

function downloadCsv(filename: string, data: string[][]) {
  const csv = data.map((row) => row.map((cell) => `"${String(cell ?? '').replaceAll('"', '""')}"`).join(',')).join('\n')
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export function BulkImportModal({ onClose }: { onClose: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [rows, setRows] = useState<MappedStudentRow[]>([])
  const [fileName, setFileName] = useState('')
  const [dragging, setDragging] = useState(false)
  const [complete, setComplete] = useState(false)
  const [credentials, setCredentials] = useState<GeneratedParentCredential[]>([])
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const parseFile = (file: File) => {
    if (!file.name.toLowerCase().endsWith('.csv')) return
    setFileName(file.name)
    setError(null)

    Papa.parse(file, {
      skipEmptyLines: 'greedy',
      complete: (results) => {
        const rawData = results.data as string[][]
        if (!rawData || rawData.length === 0) return

        // 1. Inspect first row for column headers
        const firstRow = rawData[0].map((c) =>
          String(c || '')
            .trim()
            .toLowerCase()
            .replace(/[\s-]+/g, '_')
        )

        // 2. Map indices strictly according to exact CSV header keys:
        // roll_number, student_name, grade, parent_name, parent_phone, parent_email
        const colMap: Record<CsvHeaderKey, number> = {
          roll_number: firstRow.findIndex((h) => ['roll_number', 'roll_no', 'roll', 'rollnumber'].includes(h)),
          student_name: firstRow.findIndex((h) => ['student_name', 'student', 'name', 'studentname'].includes(h)),
          grade: firstRow.findIndex((h) => ['grade', 'class', 'class_name'].includes(h)),
          parent_name: firstRow.findIndex((h) => ['parent_name', 'father_name', 'guardian_name', 'parentname', 'fathername'].includes(h)),
          parent_phone: firstRow.findIndex((h) => ['parent_phone', 'phone', 'guardian_phone', 'parentphone', 'phone_number'].includes(h)),
          parent_email: firstRow.findIndex((h) => ['parent_email', 'email', 'guardian_email', 'parentemail'].includes(h)),
        }

        const hasMatchedHeaders = Object.values(colMap).some((idx) => idx !== -1)

        let parsedRows: MappedStudentRow[] = []

        if (hasMatchedHeaders) {
          const dataRows = rawData.slice(1)
          parsedRows = dataRows.map((row, index) => {
            const getVal = (key: CsvHeaderKey): string => {
              const idx = colMap[key]
              return idx !== -1 && row[idx] !== undefined ? String(row[idx]).trim() : ''
            }

            return {
              roll_number: getVal('roll_number') || `2026-${String(index + 1).padStart(3, '0')}`,
              student_name: getVal('student_name'),
              grade: getVal('grade') || 'Class 5',
              parent_name: getVal('parent_name'),
              parent_phone: getVal('parent_phone'),
              parent_email: getVal('parent_email'),
            }
          })
        } else {
          // Positional fallback if CSV has no headers:
          // [roll_number, student_name, grade, parent_name, parent_phone, parent_email]
          parsedRows = rawData.map((row, index) => ({
            roll_number: String(row[0] || `2026-${String(index + 1).padStart(3, '0')}`).trim(),
            student_name: String(row[1] || '').trim(),
            grade: String(row[2] || 'Class 5').trim(),
            parent_name: String(row[3] || '').trim(),
            parent_phone: String(row[4] || '').trim(),
            parent_email: String(row[5] || '').trim(),
          }))
        }

        const valid = parsedRows.filter((r) => r.student_name || r.roll_number || r.parent_phone)
        setRows(valid)
      },
    })
  }

  const handleImport = async () => {
    if (rows.length === 0 || loading) return
    setLoading(true)
    setError(null)
    try {
      const result = await bulkUploadStudentsAction(rows)
      if (result.success && result.credentials) {
        setCredentials(result.credentials)
        setComplete(true)
      } else {
        setError(result.error || 'Failed to import student records. Please check your data and try again.')
      }
    } catch (err: any) {
      setError(err?.message || 'An error occurred during bulk import.')
    } finally {
      setLoading(false)
    }
  }

  const copyCredentials = async () => {
    await navigator.clipboard.writeText(
      credentials
        .map(
          (c) =>
            `${c.student_name || c.studentName || ''} (${c.roll_number || c.rollNumber || ''}) | ${c.parent_email || c.parentEmail || ''} | ${c.temporary_password || c.temporaryPassword || ''}`
        )
        .join('\n')
    )
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  return (
    <div className="admin-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="import-title">
      <div className="import-modal">
        <header className="import-header">
          <div>
            <span className="eyebrow">STUDENT MANAGEMENT · ONBOARDING</span>
            <h2 id="import-title">Import students &amp; parents</h2>
            <p>Upload a CSV to preview student records and prepare parent access.</p>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close bulk import">
            <X />
          </button>
        </header>

        {complete ? (
          <section className="import-success" aria-live="polite">
            <div className="success-icon">
              <Check />
            </div>
            <h3>Parent accounts are ready</h3>
            <p>{credentials.length} temporary credentials generated for your review.</p>

            <div className="import-table-wrap">
              <table className="import-table">
                <thead>
                  <tr>
                    {CSV_HEADER_KEYS.map((header) => (
                      <th key={header}>
                        <span className="font-mono text-xs font-semibold">{header}</span>
                      </th>
                    ))}
                    <th>
                      <span className="font-mono text-xs font-semibold">temporary_password</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {credentials.map((c, index) => (
                    <tr key={`cred-row-${index}`}>
                      <td>{c.roll_number || c.rollNumber || '—'}</td>
                      <td>{c.student_name || c.studentName || '—'}</td>
                      <td>{c.grade || '—'}</td>
                      <td>{c.parent_name || '—'}</td>
                      <td>{c.parent_phone || c.parentPhone || '—'}</td>
                      <td>{c.parent_email || c.parentEmail || '—'}</td>
                      <td className="font-mono font-bold text-blue-700">
                        {c.temporary_password || c.temporaryPassword || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="import-footer">
              <button className="admin-btn admin-btn-ghost" onClick={copyCredentials}>
                <Copy /> {copied ? 'Copied' : 'Copy credentials'}
              </button>
              <button
                className="admin-btn admin-btn-primary"
                onClick={() =>
                  downloadCsv('eduflow-parent-credentials.csv', [
                    [...CSV_HEADER_KEYS, 'temporary_password'],
                    ...credentials.map((c) => [
                      c.roll_number || c.rollNumber || '',
                      c.student_name || c.studentName || '',
                      c.grade || '',
                      c.parent_name || '',
                      c.parent_phone || c.parentPhone || '',
                      c.parent_email || c.parentEmail || '',
                      c.temporary_password || c.temporaryPassword || '',
                    ]),
                  ])
                }
              >
                <Download /> Export CSV
              </button>
            </div>
          </section>
        ) : (
          <>
            <div
              className={`upload-zone ${dragging ? 'dragging' : ''}`}
              onDragOver={(event) => {
                event.preventDefault()
                setDragging(true)
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(event) => {
                event.preventDefault()
                setDragging(false)
                const file = event.dataTransfer.files[0]
                if (file) parseFile(file)
              }}
              onClick={() => inputRef.current?.click()}
            >
              <input
                ref={inputRef}
                type="file"
                hidden
                accept=".csv"
                onChange={(event) => {
                  const file = event.target.files?.[0]
                  if (file) parseFile(file)
                }}
              />
              <div className="upload-icon">
                <Upload />
              </div>
              <strong>{fileName || 'Drop your CSV file here'}</strong>
              <span>{fileName ? 'File ready for preview' : 'or click to browse from your computer'}</span>
              <b className="format-badge">.csv format</b>
            </div>

            <div className="template-row">
              <span>
                <FileSpreadsheet /> Headers: roll_number, student_name, grade, parent_name, parent_phone, parent_email
              </span>
              <button
                className="download-template"
                onClick={() =>
                  downloadCsv('eduflow-student-parent-template.csv', [
                    [...CSV_HEADER_KEYS],
                    ['2026-001', 'Muhammad Ali', 'Class 5', 'Tariq Mehmood', '+92 300 1234567', 'parent@example.com'],
                  ])
                }
              >
                <Download /> Download template
              </button>
            </div>

            {rows.length > 0 && (
              <section className="preview-section">
                <div className="preview-heading">
                  <div>
                    <span className="eyebrow">FILE PREVIEW</span>
                    <h3>{rows.length} records ready</h3>
                  </div>
                  <span className="valid-count">
                    <Check /> Exact columns mapped
                  </span>
                </div>

                <div className="import-table-wrap">
                  <table className="import-table">
                    <thead>
                      <tr>
                        {CSV_HEADER_KEYS.map((header) => (
                          <th key={header}>
                            <span className="font-mono text-xs font-semibold">{header}</span>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rows.slice(0, 8).map((row, rowIndex) => (
                        <tr key={`preview-row-${rowIndex}`}>
                          {CSV_HEADER_KEYS.map((key) => (
                            <td key={`${key}-${rowIndex}`}>
                              <input
                                aria-label={`${key} row ${rowIndex + 1}`}
                                value={row[key] ?? ''}
                                onChange={(event) => {
                                  const val = event.target.value
                                  setRows((current) =>
                                    current.map((r, i) => (i === rowIndex ? { ...r, [key]: val } : r))
                                  )
                                }}
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="preview-note">
                  Showing first {Math.min(rows.length, 8)} of {rows.length} records. All rows will be prepared.
                </p>
              </section>
            )}

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3 my-3 text-xs text-red-700 flex items-center gap-2" role="alert">
                <AlertCircle className="size-4 shrink-0 text-red-600" />
                <span>{error}</span>
              </div>
            )}

            <footer className="import-footer">
              <button className="admin-btn admin-btn-ghost" onClick={onClose} disabled={loading}>
                Cancel
              </button>
              <button
                className="admin-btn admin-btn-primary import-action"
                disabled={rows.length === 0 || loading}
                onClick={handleImport}
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin size-4" /> Creating accounts...
                  </>
                ) : (
                  <>
                    <Check /> Prepare parent access ({rows.length})
                  </>
                )}
              </button>
            </footer>
          </>
        )}
      </div>
    </div>
  )
}
