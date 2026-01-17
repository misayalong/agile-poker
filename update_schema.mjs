import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

async function main() {
    console.log("Agile Poker - Schema Update (Add Roles & Spectator)");
    console.log("-----------------------------------");

    // Auth
    const email = process.argv[2];
    const password = process.argv[3];
    if (!email || !password) {
        console.error("Usage: node update_schema.mjs <email> <password>");
        process.exit(1);
    }

    try {
        await pb.admins.authWithPassword(email, password);
    } catch (e) {
        console.error("Auth Fail", e.message);
        process.exit(1);
    }

    try {
        const collection = await pb.collections.getFirstListItem('name="participants"');

        // Define new fields
        const newFields = [
            {
                name: 'role',
                type: 'select',
                maxSelect: 1,
                values: ['SM', 'PO', 'DEV', 'QA', 'UI/UX']
            },
            {
                name: 'is_spectator',
                type: 'bool'
            }
        ];

        // Check if fields already exist
        let updated = false;
        const currentFields = collection.fields || []; // PB v0.23+ uses 'fields' array

        // Note: SDK structure might differ slightly depending on version, 
        // but 'fields' is the standard now.

        // We clone current fields to avoid mutation issues if any
        const nextFields = JSON.parse(JSON.stringify(currentFields));

        for (const field of newFields) {
            const exists = nextFields.find(f => f.name === field.name);
            if (!exists) {
                console.log(`Adding field: ${field.name}`);
                nextFields.push(field);
                updated = true;
            }
        }

        if (updated) {
            await pb.collections.update(collection.id, {
                fields: nextFields
            });
            console.log("✅ Schema updated successfully.");
        } else {
            console.log("No updates needed. Fields already exist.");
        }

    } catch (e) {
        console.error("❌ Failed to update schema:", e.message);
        if (e.data) console.log(JSON.stringify(e.data, null, 2));
    }
}

main();
