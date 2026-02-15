const CMS_BASE = 'https://admission.dei.ac.in:8085';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { url, method = 'GET', body } = req.body;

    // Only allow CMS and cms_new paths
    if (!url || (!url.startsWith('/CMS/') && !url.startsWith('/cms_new/'))) {
        return res.status(400).json({ error: 'Invalid URL path' });
    }

    try {
        const fetchOptions = {
            method,
            headers: {},
        };

        if (body && method === 'POST') {
            fetchOptions.headers['Content-Type'] = 'application/x-www-form-urlencoded';
            fetchOptions.body = body;
        }

        const response = await fetch(`${CMS_BASE}${url}`, fetchOptions);
        const text = await response.text();

        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        return res.status(response.status).send(text);
    } catch (error) {
        console.error('Proxy error:', error.message);
        return res.status(502).json({ error: 'Failed to reach CMS server' });
    }
}
