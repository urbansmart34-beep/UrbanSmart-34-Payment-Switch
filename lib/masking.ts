/**
 * Utility to scrub Personally Identifiable Information (PII) from logs and payloads
 * before they are written to the database or returned to the client.
 */

const PII_FIELDS = ['email', 'phone', 'cardnumber', 'cvv', 'password', 'ipaddress', 'name', 'address'];

export function maskPII(data: any): any {
    if (!data) return data;

    // Handle arrays
    if (Array.isArray(data)) {
        return data.map(item => maskPII(item));
    }

    // Handle objects
    if (typeof data === 'object' && data !== null) {
        const masked: Record<string, any> = {};
        for (const [key, value] of Object.entries(data)) {
            const lowerKey = key.toLowerCase();

            // Apply masking
            if (PII_FIELDS.some(f => lowerKey.includes(f))) {
                if (typeof value === 'string') {
                    if (lowerKey.includes('email') && value.includes('@')) {
                        const [local, domain] = value.split('@');
                        masked[key] = `${local.charAt(0)}***@${domain}`;
                    } else {
                        // Keep last 4 characters visible, mask the rest
                        masked[key] = value.length > 4 ? '*'.repeat(value.length - 4) + value.slice(-4) : '***';
                    }
                } else {
                    masked[key] = '***'; // non-string PII
                }
            } else {
                masked[key] = maskPII(value); // recurse
            }
        }
        return masked;
    }

    // Primitive values
    return data;
}
