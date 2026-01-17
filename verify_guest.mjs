import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

async function main() {
    console.log("Agile Poker - Guest Access Verification");
    console.log("-----------------------------------");

    // Explicitly clearing auth to be sure
    pb.authStore.clear();
    console.log("🔒 Auth state cleared. Running as Guest.");

    const code = 'GST' + Math.floor(Math.random() * 100);
    console.log(`\nTesting Room Creation with code: ${code}`);

    try {
        const room = await pb.collection('rooms').create({
            room_code: code,
            topic: 'Guest Check',
            status: 'voting',
            round_no: 1,
            last_active_at: new Date().toISOString(),
            expired_at: new Date(Date.now() + 86400000).toISOString()
        });

        console.log("✅ Created Record:", room.id);

        // Try to fetch it
        try {
            const fetched = await pb.collection('rooms').getFirstListItem(`room_code="${code}"`);
            console.log("✅ Guest Fetch successful:", fetched.id);
        } catch (e) {
            console.error("❌ Guest Fetch failed:", e.message);
        }

    } catch (e) {
        console.error("❌ Guest Create failed:", e.message);
        if (e.data) {
            console.error("   Details:", JSON.stringify(e.data, null, 2));
        }
    }
}

main();
