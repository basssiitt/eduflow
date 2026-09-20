'use client'

import { useRef, useState } from 'react'
import Papa from 'papaparse'
import { AlertCircle, Check, Copy, Download, FileSpreadsheet, Loader2, Upload, X } from 'lucide-react'
import { bulkUploadStudentsAction } from '@/app/actions/students'

const headers = ['Roll Number', 'Student Name', 'Parent Phone', 'Parent Email']
type StudentRow = [string, string, string, string]
type Credential = { row: StudentRow; temporaryPassword: string }

function downloadCsv(filename: string, data: string[][]) {
  const csv = data.map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(',')).join('\n')
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export function BulkImportModal({ onClose }: { onClose: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [rows, setRows] = useState<StudentRow[]>([])
  const [fileName, setFileName] = useState('')
  const [dragging, setDragging] = useState(false)
  const [complete, setComplete] = useState(false)
  const [credentials, setCredentials] = useState<Credential[]>([])
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const parseFile = (file: File) => {
    if (!file.name.toLowerCase().endsWith('.csv')) return
    setFileName(file.name)
    setError(null)
    Papa.parse<string[]>(file, {
      skipEmptyLines: true,
      complete: ({ data }) => {
        const parsed = (data as string[][]).slice(1).map((row, index) => [row[0] || `2026-${String(index + 1).padStart(3, '0')}`, row[1] || '', row[2] || '', row[3] || ''] as StudentRow)
        setRows(parsed)
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
        setCredentials(
          result.credentials.map((c) => ({
            row: [c.rollNumber, c.studentName, c.parentPhone, c.parentEmail],
            temporaryPassword: c.temporaryPassword,
          }))
        )
        setComplete(true)
      } else {
        setError('Failed to import student records. Please check your data and try again.')
      }
    } catch (err: any) {
      setError(err?.message || 'An error occurred during bulk import.')
    } finally {
      setLoading(false)
    }
  }

  const copyCredentials = async () => {
    await navigator.clipboard.writeText(credentials.map(({ row, temporaryPassword }) => `${row[1]} | ${row[3]} | ${temporaryPassword}`).join('\n'))
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  return (
    <div className="admin-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="import-title">
      <div className="import-modal">
        <header className="import-header">
          <div><span className="eyebrow">STUDENT MANAGEMENT · ONBOARDING</span><h2 id="import-title">Import students &amp; parents</h2><p>Upload a CSV to preview student records and prepare parent access.</p></div>
          <button className="icon-btn" onClick={onClose} aria-label="Close bulk import"><X /></button>
        </header>
        {complete ? (
          <section className="import-success" aria-live="polite">
            <div className="success-icon"><Check /></div><h3>Parent accounts are ready</h3><p>{credentials.length} temporary credentials generated for your review.</p>
            <div className="import-table-wrap"><table className="import-table"><thead><tr>{[...headers, 'Temporary Password'].map((header) => <th key={header}>{header}</th>)}</tr></thead><tbody>{credentials.map(({ row, temporaryPassword }) => <tr key={row[0]}>{row.map((cell, index) => <td key={index}>{cell || '—'}</td>)}<td>{temporaryPassword}</td></tr>)}</tbody></table></div>
            <div className="import-footer"><button className="admin-btn admin-btn-ghost" onClick={copyCredentials}><Copy /> {copied ? 'Copied' : 'Copy credentials'}</button><button className="admin-btn admin-btn-primary" onClick={() => downloadCsv('eduflow-parent-credentials.csv', [headers.concat('Temporary Password'), ...credentials.map(({ row, temporaryPassword }) => [...row, temporaryPassword])])}><Download /> Export CSV</button></div>
          </section>
        ) : <>
          <div className={`upload-zone ${dragging ? 'dragging' : ''}`} onDragOver={(event) => { event.preventDefault(); setDragging(true) }} onDragLeave={() => setDragging(false)} onDrop={(event) => { event.preventDefault(); setDragging(false); const file = event.dataTransfer.files[0]; if (file) parseFile(file) }} onClick={() => inputRef.current?.click()}>
            <input ref={inputRef} type="file" hidden accept=".csv" onChange={(event) => { const file = event.target.files?.[0]; if (file) parseFile(file) }} /><div className="upload-icon"><Upload /></div><strong>{fileName || 'Drop your CSV file here'}</strong><span>{fileName ? 'File ready for preview' : 'or click to browse from your computer'}</span><b className="format-badge">.csv format</b>
          </div>
          <div className="template-row"><span><FileSpreadsheet /> Columns: Roll Number, Student Name, Parent Phone, Parent Email</span><button className="download-template" onClick={() => downloadCsv('eduflow-student-parent-template.csv', [headers, ['2026-001', 'Ayesha Khan', '+92 300 1234567', 'parent@example.com']])}><Download /> Download template</button></div>
          {rows.length > 0 && <section className="preview-section"><div className="preview-heading"><div><span className="eyebrow">FILE PREVIEW</span><h3>{rows.length} records ready</h3></div><span className="valid-count"><Check /> Columns mapped</span></div><div className="import-table-wrap"><table className="import-table"><thead><tr>{headers.map((header) => <th key={header}>{header}</th>)}</tr></thead><tbody>{rows.slice(0, 8).map((row, rowIndex) => <tr key={rowIndex}>{row.map((cell, cellIndex) => <td key={cellIndex}><input aria-label={`${headers[cellIndex]} row ${rowIndex + 1}`} value={cell} onChange={(event) => setRows((current) => current.map((currentRow, index) => index === rowIndex ? currentRow.map((value, innerIndex) => innerIndex === cellIndex ? event.target.value : value) as StudentRow : currentRow))} /></td>)}</tr>)}</tbody></table></div><p className="preview-note">Showing the first {Math.min(rows.length, 8)} records. All {rows.length} rows will be prepared.</p></section>}
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 my-3 text-xs text-red-700 flex items-center gap-2" role="alert">
              <AlertCircle className="size-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}
          <footer className="import-footer">
            <button className="admin-btn admin-btn-ghost" onClick={onClose} disabled={loading}>Cancel</button>
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
        </>}
      </div>
    </div>
  )
}
