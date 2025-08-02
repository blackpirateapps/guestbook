// This is your new file: netlify/functions/get-entries.js

// Using 'import' syntax for modern JavaScript modules
import fetch from 'node-fetch';

/**
 * The main handler for the Netlify serverless function.
 * This function is triggered when a request is made to /.netlify/functions/get-entries
 */
export async function handler(event, context) {
    // Get the secret environment variables from Netlify's build settings
    const { NETLIFY_ACCESS_TOKEN, GUESTBOOK_FORM_ID } = process.env;

    // --- Pre-flight checks ---
    // Check if the required environment variables are set.
    // If not, return an error message. This helps in debugging.
    if (!NETLIFY_ACCESS_TOKEN || !GUESTBOOK_FORM_ID) {
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: 'Configuration error: Required environment variables are not set. Please check your Netlify site settings.'
            }),
        };
    }

    // The API endpoint to fetch submissions for a specific form
    const url = `https://api.netlify.com/api/v1/forms/${GUESTBOOK_FORM_ID}/submissions`;

    try {
        // --- API Call ---
        // Make a secure, server-to-server request to the Netlify API
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                // Authorize the request with the secret access token
                'Authorization': `Bearer ${NETLIFY_ACCESS_TOKEN}`,
                'Content-Type': 'application/json',
            },
        });

        // If the API call was not successful, throw an error
        if (!response.ok) {
            throw new Error(`Netlify API error: ${response.statusText}`);
        }

        // Parse the JSON response from the API
        const submissions = await response.json();

        // --- Data Transformation ---
        // It's best practice to only send the data you need to the frontend.
        // This maps the raw submission data to a cleaner format.
        const cleanedSubmissions = submissions.map(submission => ({
            name: submission.data.name,
            message: submission.data.message,
            date: submission.created_at,
        }));

        // --- Success Response ---
        // Send the cleaned data back to the frontend
        return {
            statusCode: 200,
            body: JSON.stringify(cleanedSubmissions),
        };

    } catch (error) {
        // --- Error Handling ---
        // If anything goes wrong, log the error and send a generic error message
        console.error('Error in get-entries function:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to fetch guestbook entries.' }),
        };
    }
}
