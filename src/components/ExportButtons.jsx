import React from 'react';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { HiOutlineDownload } from 'react-icons/hi';

const ExportButtons = ({ data, filename = 'Export', columns }) => {
  
  const prepareData = () => {
    return data.map(item => {
      const row = {};
      columns.forEach(col => {
        let val = typeof col.selector === 'function' ? col.selector(item) : item[col.key];
        row[col.header] = val;
      });
      return row;
    });
  };

  const exportCSV = () => {
    const formattedData = prepareData();
    const ws = XLSX.utils.json_to_sheet(formattedData);
    const csv = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportExcel = () => {
    const formattedData = prepareData();
    const ws = XLSX.utils.json_to_sheet(formattedData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, `${filename}.xlsx`);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    const tableColumn = columns.map(col => col.header);
    const tableRows = prepareData().map(row => columns.map(col => row[col.header]));

    doc.setFontSize(14);
    doc.text(`${filename} Report`, 14, 15);
    
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [15, 118, 110] }
    });
    
    doc.save(`${filename}.pdf`);
  };

  if (!data || data.length === 0) return null;

  return (
    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}><HiOutlineDownload style={{ verticalAlign: 'middle', marginRight: '2px' }}/> Export:</span>
      <button onClick={exportCSV} className="btn-outline" style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem', borderColor: '#ccc', color: '#555' }}>CSV</button>
      <button onClick={exportExcel} className="btn-outline" style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem', borderColor: '#107c41', color: '#107c41' }}>Excel</button>
      <button onClick={exportPDF} className="btn-outline" style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem', borderColor: '#b30b00', color: '#b30b00' }}>PDF</button>
    </div>
  );
};

export default ExportButtons;
