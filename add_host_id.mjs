import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

async function main() {
    const email = process.argv[2];
    const password = process.argv[3];

    if (!email || !password) {
        console.log("Usage: node add_host_id.mjs <admin_email> <admin_password>");
        process.exit(1);
    }

    try {
        await pb.admins.authWithPassword(email, password);
    } catch (e) {
        console.error("❌ Auth Failed:", e.message);
        process.exit(1);
    }

    try {
        // Get current schema
        const collection = await pb.collections.getOne('rooms');

        // Detect fields or schema
        const currentFields = collection.fields || collection.schema;

        if (!currentFields) {
            console.error("❌ Could not find 'fields' or 'schema' in collection object:", JSON.stringify(collection, null, 2));
            return;
        }

        // Check if host_id already exists
        if (currentFields.find(f => f.name === 'host_id')) {
            console.log("✅ 'host_id' already exists.");
            return;
        }

        // Add host_id field
        const newField = {
            name: 'host_id',
            type: 'text',
            required: false,
            presentable: false,
            unique: false
        };

        // Update collection
        const updateData = {};
        if (collection.fields) {
            updateData.fields = [...collection.fields, newField];
        } else {
            updateData.schema = [...collection.schema, newField];
        }

        await pb.collections.update(collection.id, updateData);

        console.log("✅ Successfully added 'host_id' to 'rooms' collection.");

    } catch (e) {
        console.error("❌ Failed to update schema:", e.message);
    }
}

main();
