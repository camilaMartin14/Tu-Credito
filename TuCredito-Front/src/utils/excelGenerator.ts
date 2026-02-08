import * as XLSX from 'xlsx';

export const exportToExcel = (data: any[], fileName: string, sheetName: string = 'Sheet1') => {
  if (!data || data.length === 0) {
    console.warn('No data to export');
    return;
  }

  // Create a new workbook
  const workbook = XLSX.utils.book_new();

  // Convert the data to a worksheet
  const worksheet = XLSX.utils.json_to_sheet(data);

  // Auto-width columns based on content
  const columnWidths = data.reduce((acc: any, row: any) => {
    Object.keys(row).forEach((key, index) => {
      const cellValue = row[key] ? row[key].toString() : '';
      const currentWidth = acc[index] || 10; // Min width 10
      acc[index] = Math.max(currentWidth, cellValue.length + 2);
    });
    return acc;
  }, []);

  worksheet['!cols'] = columnWidths.map((width: number) => ({ wch: width }));

  // Append the worksheet to the workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // Generate the Excel file and trigger download
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};
