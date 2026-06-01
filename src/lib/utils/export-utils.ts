/**
 * Utility functions for exporting data from the client side.
 */

/**
 * Triggers a download of a text-based file.
 */
function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  
  // Cleanup
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Exports data as a JSON file.
 */
export function exportJSON(data: unknown, filename: string) {
  const content = JSON.stringify(data, null, 2);
  downloadFile(content, filename, "application/json");
}

/**
 * Exports a string as a raw text file (used for SQL/GraphQL).
 */
export function exportText(content: string, filename: string) {
  downloadFile(content, filename, "text/plain");
}

/**
 * Exports an array of objects as a CSV file.
 * Handles flattening and escaping quotes.
 */
export function exportCSV(data: Record<string, unknown>[], filename: string) {
  if (!data || data.length === 0) return;

  // Extract all unique headers from the objects
  const headersSet = new Set<string>();
  for (const row of data) {
    for (const key of Object.keys(row)) {
      headersSet.add(key);
    }
  }
  const headers = Array.from(headersSet);

  const escapeCSV = (value: unknown): string => {
    if (value === null || value === undefined) return "";
    const str = String(value);
    if (str.includes(",") || str.includes('"') || str.includes("\\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const csvRows = [];
  
  // Header row
  csvRows.push(headers.map(escapeCSV).join(","));

  // Data rows
  for (const row of data) {
    const values = headers.map(header => escapeCSV(row[header]));
    csvRows.push(values.join(","));
  }

  const csvContent = csvRows.join("\\n");
  downloadFile(csvContent, filename, "text/csv");
}
