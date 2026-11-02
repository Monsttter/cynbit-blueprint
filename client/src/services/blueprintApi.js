const apiBaseUrl = (import.meta.env?.VITE_API_BASE_URL || '/api').replace(/\/+$/, '');

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${apiBaseUrl}/blueprints${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...options.headers },
    });
  } catch (error) {
    if (error?.name === 'AbortError') throw error;
    throw new Error('The server could not be reached. Check your connection and try again. Your draft is still saved on this device.');
  }
  let data;
  try { data = await response.json(); } catch { data = {}; }
  if (!response.ok) {
    const error = new Error(data.error || 'We could not complete this request. Please try again.');
    error.fields = data.fields || {};
    error.status = response.status;
    throw error;
  }
  return data;
}

export function submitBlueprint(answers) {
  const { contactName, contactEmail, company, ...projectAnswers } = answers;
  return request('', {
    method: 'POST',
    body: JSON.stringify({ contact: { name: contactName, email: contactEmail, company }, answers: projectAnswers }),
  });
}

export function fetchBlueprint(reference, signal) {
  return request(`/${encodeURIComponent(reference)}`, { method: 'GET', signal, headers: {} });
}
