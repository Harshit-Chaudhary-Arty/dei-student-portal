const CMS_BASE = 'https://admission.dei.ac.in:8085';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { url, method = 'GET', body, cookies: cmsCookies } = req.body;

    // Only allow CMS and cms_new paths
    if (!url || (!url.startsWith('/CMS/') && !url.startsWith('/cms_new/'))) {
        return res.status(400).json({ error: 'Invalid URL path' });
    }

    try {
        const fetchOptions = {
            method,
            headers: {},
            redirect: 'manual',
        };

        // Forward CMS session cookies if provided
        if (cmsCookies) {
            fetchOptions.headers['Cookie'] = cmsCookies;
        }

        if (body && method === 'POST') {
            fetchOptions.headers['Content-Type'] = 'application/x-www-form-urlencoded';
            fetchOptions.body = body;
        }

        const response = await fetch(`${CMS_BASE}${url}`, fetchOptions);
        const text = await response.text();

        // Capture set-cookie headers from CMS to relay back to the client
        const setCookieHeaders = response.headers.getSetCookie
            ? response.headers.getSetCookie()
            : [response.headers.get('set-cookie')].filter(Boolean);

        const responseCookies = setCookieHeaders
            .map(c => c.split(';')[0]) // keep only name=value
            .join('; ');

        // Return both the CMS response and any session cookies
        res.setHeader('Content-Type', 'application/json');
        return res.status(200).json({
            status: response.status,
            body: text,
            cookies: responseCookies || '',
        });
    } catch (error) {
        console.error('Proxy error:', error.message);
        return res.status(502).json({ error: 'Failed to reach CMS server' });
    }
}
