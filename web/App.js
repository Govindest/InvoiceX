const form = document.getElementById('upload-form');
const fileInput = document.getElementById('invoice-file');
const statusEl = document.getElementById('status');
const statusText = document.getElementById('status-text');
const resultEl = document.getElementById('result');
const parsedJson = document.getElementById('parsed-json');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!fileInput.files.length) return alert('Please select a file.');

  // show status
  statusEl.classList.remove('hidden');
  statusText.textContent = 'Uploading...';
  resultEl.classList.add('hidden');

  const file = fileInput.files[0];
  const formData = new FormData();
  formData.append('invoice', file);

  try {
    // call your API endpoint (adjust URL as needed)
    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });

    if (!res.ok) throw new Error(await res.text());

    // poll for job completion if your API returns a job ID
    const { jobId } = await res.json();
    statusText.textContent = 'Parsing invoice...';

    // simple polling loop
    let data;
    while (true) {
      await new Promise(r => setTimeout(r, 1000));
      const check = await fetch(`/api/status/${jobId}`);
      const status = await check.json();
      if (status.state === 'done') {
        data = status.result;
        break;
      }
      statusText.textContent = `Parsing... (${status.progress || 0}%)`;
    }

    // show result
    statusText.textContent = 'Done!';
    parsedJson.textContent = JSON.stringify(data, null, 2);
    resultEl.classList.remove('hidden');

  } catch (err) {
    statusText.textContent = 'Error: ' + err.message;
  }
});
