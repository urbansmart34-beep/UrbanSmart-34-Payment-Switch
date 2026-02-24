async function testReconciliation() {
    console.log("Mocking a settlement payload from YOCO and NORTH...");

    const payload = {
        records: [
            // Should match perfectly
            { processor: 'NORTH', processorChargeId: 'TXN_9F211C60', amount: 5000, status: 'PENDING' },

            // Should flagAMOUNT_MISMATCH (Our db was 5000, Yoco settled for 4000)
            { processor: 'YOCO', processorChargeId: 'TXN_BBF94A0D', amount: 4000, status: 'PENDING' },

            // Should flag MISSING_IN_LEDGER 
            { processor: 'YOCO', processorChargeId: 'ch_phantom_123', amount: 9900, status: 'SUCCESS' }
        ]
    };

    try {
        const res = await fetch('http://localhost:3000/api/reconciliation/ingest', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await res.json();
        console.log("Response:", res.status);
        console.dir(data, { depth: null });
    } catch (e) {
        console.error("Test failed", e);
    }
}

testReconciliation();
