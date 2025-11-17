const envBase = process.env.REACT_APP_API_BASE && process.env.REACT_APP_API_BASE.trim();

// Detect if we're running in Kubernetes (port 30080) or local dev
function getApiBase() {
	if (envBase) return envBase;
	
	const hostname = location.hostname;
	const port = location.port || window.location.port || '';
	
	// If on localhost and port is 30080 (K8s NodePort) or empty (default http port), use backend NodePort
	if ((hostname === 'localhost' || hostname === '127.0.0.1') && (port === '30080' || port === '')) {
		return 'http://localhost:30040/api';
	}
	
	// Local development on port 4000
	if (hostname === 'localhost' || hostname === '127.0.0.1') {
		return 'http://localhost:4000/api';
	}
	
	// Production/other: use same origin with backend port
	return location.origin.replace(/:\d+$/, ':30040') + '/api';
}

export const API_BASE = getApiBase();

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




