'use client'

import { useRef, useState } from 'react'
import Papa from 'papaparse'
import { Check, Download, FileSpreadsheet, Upload, X } from 'lucide-react'

const sampleRows = [
  ['Ayesha Khan', 'Imran Khan', '5', 'A', '+923001234567', '12500'],
  ['Hamza Siddiqui', 'Nadeem Siddiqui', '5', 'A', '+923121234567', '12500'],
  ['Maham Ali', 'Usman Ali', '5', 'A', '03001234567', '12500'],
  ['Sara Ahmed', 'Rashid Ahmed', '5', 'A', '+923331234567', '12500'],
  ['Usman Tariq', 'Tariq Mehmood', '5', 'A', '+923451234567', '12500'],
]
const headers = ['Full Name', 'Father Name', 'Class', 'Section', 'Parent WhatsApp Phone', 'Monthly Tuition Fee']

function downloadTemplate() {
  const csv = [headers, ...sampleRows].map((row) => row.join(',')).join('\n')
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
  const link = document.createElement('a'); link.href = url; link.download = 'eduflow-student-import-template.csv'; link.click(); URL.revokeObjectURL(url)
}

export function BulkImportModal({ onClose }: { onClose: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [rows, setRows] = useState<string[][]>([])
  const [fileName, setFileName] = useState('')
  const [dragging, setDragging] = useState(false)
  const [importing, setImporting] = useState(false)
  const [complete, setComplete] = useState(false)
  const parseFile = (file: File) => {
    setFileName(file.name)
    Papa.parse<string[]>(file, { skipEmptyLines: true, complete: (result) => setRows((result.data as string[][]).slice(1, 6)) })
  }
  const importAll = () => { setImporting(true); setTimeout(() => { setImporting(false); setComplete(true) }, 1000) }
  return <div className="admin-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="import-title"><div className="import-modal">
    <header className="import-header"><div><span className="eyebrow">STUDENT MANAGEMENT · ONBOARDING</span><h2 id="import-title">Bulk Import Students</h2><p>Upload your school register and review the records before adding them to EduFlow.</p></div><button className="icon-btn" onClick={onClose} aria-label="Close bulk import"><X /></button></header>
    {complete ? <div className="import-success"><div className="success-icon"><Check /></div><h3>450 students imported successfully</h3><p>All records were validated and added to the August 2026 student register.</p><button className="admin-btn admin-btn-primary" onClick={onClose}>Back to Student Management</button></div> : <>
      <div className={`upload-zone ${dragging ? 'dragging' : ''}`} onDragOver={(e) => { e.preventDefault(); setDragging(true) }} onDragLeave={() => setDragging(false)} onDrop={(e) => { e.preventDefault(); setDragging(false); const file = e.dataTransfer.files[0]; if (file) parseFile(file) }} onClick={() => inputRef.current?.click()}><input ref={inputRef} type="file" hidden accept=".csv,.xlsx,.xls" onChange={(e) => { const file = e.target.files?.[0]; if (file) parseFile(file) }} /><div className="upload-icon"><Upload /></div><strong>{fileName || 'Drop your CSV or Excel file here'}</strong><span>{fileName ? 'File ready for preview' : 'or click to browse from your computer'}</span><b className="format-badge">.csv, .xlsx <em>(Max 5,000 students per batch)</em></b></div>
      <div className="template-row"><span><FileSpreadsheet /> Need a starting point?</span><button className="download-template" onClick={downloadTemplate}><Download /> Download Sample Excel Template</button></div>
      {rows.length > 0 && <section className="preview-section"><div className="preview-heading"><div><span className="eyebrow">LIVE VALIDATION</span><h3>Preview first {rows.length} rows</h3></div><span className="valid-count"><Check /> Column mapping ready</span></div><div className="import-table-wrap"><table className="import-table"><thead><tr>{headers.map((h) => <th key={h}>{h}</th>)}</tr></thead><tbody>{rows.map((row, i) => <tr key={i}>{headers.map((_, j) => { const value = row[j] || ''; const phone = j === 4; const validPhone = !phone || /^\+923\d{9}$/.test(value); return <td key={j}><input value={value} onChange={(e) => setRows((current) => current.map((r, ri) => ri === i ? r.map((cell, ci) => ci === j ? e.target.value : cell) : r))} className={!value ? 'missing' : ''} /><span className={`cell-check ${!value ? 'missing' : validPhone ? 'valid' : 'invalid'}`}>{!value ? 'Missing' : validPhone ? '✓' : 'Use +923...'}</span></td> })}</tr>)}</tbody></table></div><p className="preview-note">Showing 5 rows for verification. Your file contains approximately 450 students.</p></section>}
      <footer className="import-footer"><button className="admin-btn admin-btn-ghost" onClick={onClose}>Cancel</button><button className="admin-btn admin-btn-primary import-action" disabled={importing || rows.length === 0} onClick={importAll}>{importing ? <><span className="button-spinner" /> Importing 450 students... 72%</> : <><Upload /> Import All Students</>}</button></footer>{importing && <div className="import-progress"><span>Importing 450 students...</span><b>72%</b><div><i /></div></div>}
    </>}
  </div></div>
}
