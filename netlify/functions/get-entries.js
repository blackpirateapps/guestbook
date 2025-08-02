// This function runs on Netlify's servers, not in the browser.
// It uses the built-in 'fetch' command, so no other files are needed.

export async function handler(event, context) {
    // Get the secret environment variables you set in the Netlify UI.
    const { NETLIFY_ACCESS_TOKEN, GUESTBOOK_FORM_ID } = process.env;

    // Check if the required secrets are available.
    if (!NETLIFY_ACCESS_TOKEN || !GUESTBOOK_FORM_ID) {
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: 'Configuration error: Please set NETLIFY_ACCESS_TOKEN and GUESTBOOK_FORM_ID in your Netlify site settings.'
            }),
        };
    }

    // The Netlify API endpoint to get form submissions.
    const url = `https://api.netlify.com/api/v1/forms/${GUESTBOOK_FORM_ID}/submissions`;

    try {
        // Securely call the Netlify API from the server.
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${NETLIFY_ACCESS_TOKEN}`,
            },
        });

        if (!response.ok) {
            throw new Error(`Netlify API error: ${response.statusText}`);
        }

        const submissions = await response.json();

        // --- THIS IS THE UPDATED PART ---
        // We now explicitly look for 'submission.data.website' and include it.
        const cleanedSubmissions = submissions.map(submission => ({
            name: submission.data.name,
            message: submission.data.message,
            website: submission.data.website, // This line is crucial
            date: submission.created_at,
        }));

        return {
            statusCode: 200,
            body: JSON.stringify(cleanedSubmissions),
        };

    } catch (error) {
        console.error('Error in get-entries function:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to fetch guestbook entries.' }),
        };
    }
}
