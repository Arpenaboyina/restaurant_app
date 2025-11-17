const envBase = process.env.REACT_APP_API_BASE && process.env.REACT_APP_API_BASE.trim();
export const API_BASE =
	envBase ||
	((location.hostname === 'localhost' || location.hostname === '127.0.0.1')
		? 'http://localhost:4000/api'
		: (location.origin.replace(/:\d+$/, ':4000') + '/api'));

export async function api(path, { method = 'GET', body, token } = {}) {
	try {
		const res = await fetch(API_BASE + path, {
			method,
			headers: {
				'Content-Type': 'application/json',
				...(token ? { 'Authorization': 'Bearer ' + token } : {}),
			},
			body: body ? JSON.stringify(body) : undefined,
			mode: 'cors',
		});
		const data = await res.json().catch(() => ({}));
		if (!res.ok) throw new Error(data.error || res.statusText);
		return data;
	} catch (err) {
		const hint = `Failed to reach backend at ${API_BASE}${path}. Is the backend running on port 4000?`;
		throw new Error(err?.message?.includes('Failed to fetch') ? hint : (err?.message || hint));
	}
}




