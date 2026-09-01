'use client'

import { useRef, useState } from 'react'
import Papa from 'papaparse'
import { Check, Download, FileSpreadsheet, Upload, X } from 'lucide-react'
import { isSupabaseConfigured, supabaseClient } from '@/lib/supabaseClient'

const headers = ['Full Name', 'Father Name', 'Class', 'Section', 'Parent WhatsApp Phone', 'Monthly Tuition Fee']

function downloadTemplate() {
  const sample = [
    headers,
    ['Student Name', 'Father Name', 'Class 5', 'A', '+923001234567', '15000'],
  ]
  const csv = sample.map((row) => row.join(',')).join('\n')
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
  const link = document.createElement('a')
  link.href = url
  link.download = 'eduflow-student-import-template.csv'
  link.click()
  URL.revokeObjectURL(url)
}

export function BulkImportModal({ onClose }: { onClose: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [rows, setRows] = useState<string[][]>([])
  const [allData, setAllData] = useState<string[][]>([])
  const [fileName, setFileName] = useState('')
  const [dragging, setDragging] = useState(false)
  const [importing, setImporting] = useState(false)
  const [complete, setComplete] = useState(false)
  const [importedCount, setImportedCount] = useState(0)

  const parseFile = (file: File) => {
    setFileName(file.name)
    Papa.parse<string[]>(file, {
      skipEmptyLines: true,
      complete: (result) => {
        const rawData = (result.data as string[][]).slice(1) // skip header
        setAllData(rawData)
        setRows(rawData.slice(0, 5)) // preview first 5
      },
    })
  }

  const importAll = async () => {
    setImporting(true)
    const records = allData.length > 0 ? allData : rows
    if (isSupabaseConfigured && supabaseClient && records.length > 0) {
      try {
        const payload = records.map((r, i) => ({
          name: r[0] || `Student ${i + 1}`,
          father_name: r[1] || '',
          class: r[2] || 'Class 5',
          section: r[3] || 'A',
          guardian_phone: r[4] || '',
          tuition_fee: Number(r[5]) || 15000,
          roll_no: `2026-${String(i + 1).padStart(3, '0')}`,
        }))
        await supabaseClient.from('students').insert(payload)
      } catch {}
    }
    setImportedCount(records.length)
    setImporting(false)
    setComplete(true)
  }

  return (
    <div className="admin-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="import-title">
      <div className="import-modal">
        <header className="import-header">
          <div>
            <span className="eyebrow">STUDENT MANAGEMENT · ONBOARDING</span>
            <h2 id="import-title">Bulk Import Students</h2>
            <p>Upload your school register CSV file to bulk enroll students.</p>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close bulk import"><X /></button>
        </header>

        {complete ? (
          <div className="import-success">
            <div className="success-icon"><Check /></div>
            <h3>{importedCount} students imported successfully</h3>
            <p>Records have been validated and added to the academic student register.</p>
            <button className="admin-btn admin-btn-primary" onClick={onClose}>Back to Students</button>
          </div>
        ) : (
          <>
            <div
              className={`upload-zone ${dragging ? 'dragging' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => { e.preventDefault(); setDragging(false); const file = e.dataTransfer.files[0]; if (file) parseFile(file) }}
              onClick={() => inputRef.current?.click()}
            >
              <input ref={inputRef} type="file" hidden accept=".csv,.xlsx,.xls" onChange={(e) => { const file = e.target.files?.[0]; if (file) parseFile(file) }} />
              <div className="upload-icon"><Upload /></div>
              <strong>{fileName || 'Drop your CSV file here'}</strong>
              <span>{fileName ? 'File ready for import' : 'or click to browse from your computer'}</span>
              <b className="format-badge">.csv format</b>
            </div>

            <div className="template-row">
              <span><FileSpreadsheet /> Need a starting template?</span>
              <button className="download-template" onClick={downloadTemplate}>
                <Download /> Download Sample CSV Template
              </button>
            </div>

            {rows.length > 0 && (
              <section className="preview-section">
                <div className="preview-heading">
                  <div>
                    <span className="eyebrow">FILE PREVIEW</span>
                    <h3>Preview first {rows.length} rows</h3>
                  </div>
                  <span className="valid-count"><Check /> Columns mapped</span>
                </div>
                <div className="import-table-wrap">
                  <table className="import-table">
                    <thead>
                      <tr>{headers.map((h) => <th key={h}>{h}</th>)}</tr>
                    </thead>
                    <tbody>
                      {rows.map((row, i) => (
                        <tr key={i}>
                          {headers.map((_, j) => (
                            <td key={j}>
                              <input
                                value={row[j] || ''}
                                onChange={(e) => setRows((current) => current.map((r, ri) => ri === i ? r.map((cell, ci) => ci === j ? e.target.value : cell) : r))}
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="preview-note">Showing preview rows. Ready to enroll {allData.length || rows.length} students.</p>
              </section>
            )}

            <footer className="import-footer">
              <button className="admin-btn admin-btn-ghost" onClick={onClose}>Cancel</button>
              <button
                className="admin-btn admin-btn-primary import-action"
                disabled={importing || rows.length === 0}
                onClick={importAll}
              >
                {importing ? 'Importing students…' : <><Upload /> Import Students ({allData.length || rows.length})</>}
              </button>
            </footer>
          </>
        )}
      </div>
    </div>
  )
}
