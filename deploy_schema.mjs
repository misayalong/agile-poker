import PocketBase from 'pocketbase';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to convert old schema format (v0.22-) to new (v0.23+)
function convertToNewFormat(oldCollections) {
    return oldCollections.map(oldCol => {
        const newCol = { ...oldCol };

        // 1. Rename 'schema' to 'fields' if 'fields' is missing
        if (!newCol.fields && newCol.schema) {
            newCol.fields = newCol.schema;
            delete newCol.schema;
        }

        // 2. Flatten 'options' inside fields
        if (newCol.fields) {
            newCol.fields = newCol.fields.map(field => {
                const newField = { ...field };
                if (newField.options) {
                    // Spread options to root of field
                    Object.assign(newField, newField.options);
                    delete newField.options;
                }
                return newField;
            });
        }

        return newCol;
    });
}

async function main() {
    const args = process.argv.slice(2);
    if (args.length < 3) {
        console.log("Usage: node deploy_schema.mjs <URL> <Email> <Password>");
        console.log("Example: node deploy_schema.mjs https://my-app.pockethost.io admin@example.com mypass123");
        process.exit(1);
    }

    const [url, email, password] = args;

    console.log(`Connecting to ${url}...`);
    const pb = new PocketBase(url);

    try {
        await pb.admins.authWithPassword(email, password);
        console.log("✅ Authenticated as admin.");

        // Debug: Check existing collections safely
        const existingCollections = await pb.collections.getFullList();
        console.log("ℹ️ Existing collections on remote:");
        existingCollections.forEach(c => {
            console.log(` - ${c.name} (${c.id})`);
            const fields = c.fields || c.schema || [];
            if (c.name === 'participants') {
                console.log("   Fields:", fields.map(f => f.name).join(', '));
            }
        });

    } catch (e) {
        console.error("❌ Authentication or fetch failed:", e.message);
        process.exit(1);
    }

    try {
        const schemaPath = path.join(__dirname, 'pb_schema.json');
        const schemaRaw = fs.readFileSync(schemaPath, 'utf8');
        const oldSchema = JSON.parse(schemaRaw);

        console.log("✨ Converting schema to new format (flattening options)...");
        const schema = convertToNewFormat(oldSchema);

        // Pass 1: Create collections and fields (without indexes)
        // This prevents errors where indexes try to reference columns that are being created in the same transaction
        console.log("Step 1/2: Importing collections and fields...");
        const schemaNoIndexes = schema.map(col => ({ ...col, indexes: [] }));
        await pb.collections.import(schemaNoIndexes, false);
        console.log("✅ Collections and fields imported.");

        // Debug: Verify participants after Step 1
        try {
            const list2 = await pb.collections.getFullList();
            const pColl = list2.find(c => c.name === 'participants');
            if (pColl) {
                const fields = pColl.fields || pColl.schema || [];
                console.log("ℹ️ 'participants' fields after Step 1:", fields.map(f => f.name).join(', '));
            }
        } catch (err) { console.log("Debug check failed:", err.message); }


        // Pass 2: Create indexes and apply final schema
        console.log("Step 2/2: Applying indexes...");
        await pb.collections.import(schema, false);

        console.log("✅ Schema imported successfully!");
    } catch (e) {
        console.error("❌ Schema import failed:", e.message);
        if (e.originalError) {
            console.error("Details:", JSON.stringify(e.originalError, null, 2));
        } else if (e.data) {
            console.error("Details:", JSON.stringify(e.data, null, 2));
        }
        process.exit(1);
    }
}

main();
