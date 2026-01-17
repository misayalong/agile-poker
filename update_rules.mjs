import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

async function main() {
    console.log("Agile Poker - Setting Public API Rules");
    console.log("-----------------------------------");

    const email = process.argv[2];
    const password = process.argv[3];

    if (!email || !password) {
        console.error("Usage: node update_rules.mjs <admin_email> <admin_password>");
        process.exit(1);
    }

    try {
        await pb.admins.authWithPassword(email, password);
        console.log("✅ Authenticated as Admin");
    } catch (e) {
        console.error("❌ Authentication failed:", e.message);
        process.exit(1);
    }

    const collections = ['rooms', 'participants', 'votes'];

    for (const name of collections) {
        try {
            const collection = await pb.collections.getFirstListItem(`name="${name}"`); // Actually getOne by name is tricky in SDK if id unknown.
            // Better: find by name in full list
            // Or use getFirstListItem on 'collections' -> Internal PB collection? No.
            // PB SDK: pb.collections.getOne(id) or pb.collections.getList(1,1,{filter:`name='${name}'`})

            const list = await pb.collections.getList(1, 1, { filter: `name="${name}"` });
            if (list.items.length === 0) {
                console.log(`⚠️ Collection '${name}' not found.`);
                continue;
            }
            const record = list.items[0];

            await pb.collections.update(record.id, {
                listRule: "",
                viewRule: "",
                createRule: "",
                updateRule: "",
                deleteRule: "", // MVP: Allow delete for now or restrict? V1 requirements: "status: revealed", etc. Let's keep public for MVP simplicity.
            });
            console.log(`✅ Rules updated for '${name}' (Public Read/Write)`);

        } catch (e) {
            console.error(`❌ Failed to update rules for '${name}':`, e.message);
        }
    }
    console.log("-----------------------------------");
    console.log("🎉 API Rules configured. You are ready to go!");
}

main();
