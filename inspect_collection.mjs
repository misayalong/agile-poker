import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

async function main() {
    console.log("Agile Poker - Inspect Schema");
    console.log("-----------------------------------");

    // Authenticate (technically not needed for viewing public collections if public, but good for safety)
    try {
        // public read of _collections might be restricted. Usually need admin.
        const email = process.argv[2];
        const password = process.argv[3];
        if (email && password) await pb.admins.authWithPassword(email, password);
    } catch (e) { }

    try {
        const roomCol = await pb.collections.getOne('rooms');
        console.log("Collection: rooms");
        console.log("ID:", roomCol.id);
        console.log("Fields:");
        roomCol.schema.forEach(f => {
            console.log(` - ${f.name} (${f.type}) required=${f.required}`);
        });

    } catch (e) {
        // Fallback if getOne('rooms') fails (it expects ID usually, or name works?)
        // SDK getOne takes ID or name? SDK says: getOne(id). getFirstListItem('name="rooms"') for collections?
        // Actually pb.collections.getOne(nameOrId) works in recent versions?
        // Let's safe bet: getList
        try {
            const list = await pb.collections.getList(1, 1, { filter: 'name="rooms"' });
            if (list.items.length) {
                const roomCol = list.items[0];
                console.log("Collection: rooms (found via list)");
                console.log("Fields:");
                roomCol.schema.forEach(f => {
                    console.log(` - ${f.name} (${f.type})`);
                });
            } else {
                console.log("❌ Collection 'rooms' not found via list.");
            }
        } catch (ex) {
            console.error("❌ Failed to fetch collection info:", ex.message);
        }
    }
}

main();
