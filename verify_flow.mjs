import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

async function main() {
    console.log("Agile Poker - Deep Verification (v4)");
    console.log("-----------------------------------");

    const email = process.argv[2];
    const password = process.argv[3];
    if (email) await pb.admins.authWithPassword(email, password);

    try {
        const list = await pb.collections.getList(1, 1, { filter: 'name="rooms"' });
        if (list.items.length) {
            const roomsCol = list.items[0];
            const fields = roomsCol.fields || roomsCol.schema || [];

            console.log("Found 'rooms' collection.");
            console.log("Field Count:", fields.length);
            fields.forEach(f => console.log(` - ${f.name} [${f.type}]`));

            if (fields.length === 0) {
                console.error("❌ 'rooms' collection still has NO fields!");
                return;
            }
        } else {
            console.error("❌ Collection 'rooms' does not exist.");
            return;
        }
    } catch (e) {
        console.error("Error inspecting:", e.message);
    }

    const code = 'CHK' + Math.floor(Math.random() * 100);
    console.log(`\nTesting Data Integrity with code: ${code}`);

    try {
        const room = await pb.collection('rooms').create({
            room_code: code,
            topic: 'Fields Check',
            status: 'voting'
        });

        console.log("Created Record:", room.id);
        console.log("Saved Data:", JSON.stringify(room, null, 2));

        if (!room.room_code) {
            console.error("❌ 'room_code' was NOT saved.");
        } else {
            console.log("✅ 'room_code' saved correctly!");
        }

    } catch (e) {
        console.error("❌ Test failed:", e.message);
    }
}

main();
