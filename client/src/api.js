export async function summarizeDocument(file, instruction) {
  const formData = new FormData();
  formData.append('document', file);
  formData.append('instruction', instruction);

  const response = await fetch('/api/summarize', {
    method: 'POST',
    body: formData,
  });
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error?.message || 'The document could not be summarized. Please try again.');
  }

  return result;
}
