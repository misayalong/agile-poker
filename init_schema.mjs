import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

async function main() {
    console.log("Agile Poker - Schema Initialization (v11 - Fix Structure)");
    console.log("-----------------------------------");
    console.log("NOTE: Moving relation options to top-level field properties.");

    // Auth
    const email = process.argv[2];
    const password = process.argv[3];
    if (!email) process.exit(1);

    try {
        await pb.admins.authWithPassword(email, password);
    } catch (e) { console.error("Auth Fail"); process.exit(1); }

    const deleteIfExists = async (name) => {
        try {
            const list = await pb.collections.getFullList();
            const col = list.find(c => c.name === name);
            if (col) await pb.collections.delete(col.id);
        } catch (e) { }
    };

    // Cleanup
    await deleteIfExists('votes');
    await deleteIfExists('participants');
    await deleteIfExists('rooms');

    // 1. Create Rooms
    let rooms;
    try {
        rooms = await pb.collections.create({
            name: 'rooms',
            type: 'base',
            fields: [
                { name: 'room_code', type: 'text', required: true, presentable: true, unique: true },
                { name: 'topic', type: 'text' },
                // options can still be used for legacy or specific types, but let's try top level for known ones if needed?
                // Actually text/number options usually stay in options or specific props?
                // For 'text', min/max/pattern are direct props now too? Let's check error messages.
                // But previous errors complained mainly about 'values' (select) and 'collectionId' (relation).
                // Let's assume 'select' values also need to be top level?
                // Let's try 'text' for status first to be safe as v8 did.
                { name: 'status', type: 'text', required: true },
                { name: 'round_no', type: 'number' }, // simplified
                { name: 'last_active_at', type: 'date' },
                { name: 'expired_at', type: 'date' }
            ]
        });
        console.log("✅ Collection 'rooms' created. ID:", rooms.id);

        await pb.collections.update(rooms.id, { listRule: "", viewRule: "", createRule: "", updateRule: "", deleteRule: "" });

    } catch (e) {
        console.error("❌ Failed 'rooms'", e.message);
        if (e.data) console.log(JSON.stringify(e.data, null, 2));
        process.exit(1);
    }

    // 2. Create Participants
    let participants;
    try {
        participants = await pb.collections.create({
            name: 'participants',
            type: 'base',
            fields: [
                {
                    name: 'room_id',
                    type: 'relation',
                    required: true,
                    // MOVED FROM options TO ROOT
                    collectionId: rooms.id,
                    cascadeDelete: true,
                    maxSelect: 1
                },
                { name: 'client_id', type: 'text', required: true },
                { name: 'nickname', type: 'text', required: true },
                { name: 'last_seen_at', type: 'date' }
            ]
        });
        console.log("✅ Collection 'participants' created. ID:", participants.id);

        await pb.collections.update(participants.id, { listRule: "", viewRule: "", createRule: "", updateRule: "", deleteRule: "" });

    } catch (e) {
        console.error("❌ Failed 'participants':", e.message);
        if (e.data) console.log("Details:", JSON.stringify(e.data, null, 2));
        process.exit(1);
    }

    // 3. Create Votes
    try {
        const votes = await pb.collections.create({
            name: 'votes',
            type: 'base',
            fields: [
                {
                    name: 'room_id',
                    type: 'relation',
                    required: true,
                    collectionId: rooms.id,
                    cascadeDelete: true,
                    maxSelect: 1
                },
                {
                    name: 'participant_id',
                    type: 'relation',
                    required: true,
                    collectionId: participants.id,
                    cascadeDelete: true,
                    maxSelect: 1
                },
                { name: 'round_no', type: 'number', required: true },
                { name: 'point', type: 'text', required: true }
            ]
        });
        console.log("✅ Collection 'votes' created. ID:", votes.id);

        await pb.collections.update(votes.id, { listRule: "", viewRule: "", createRule: "", updateRule: "", deleteRule: "" });

    } catch (e) {
        console.error("❌ Failed 'votes':", e.message);
        if (e.data) console.log("Details:", JSON.stringify(e.data, null, 2));
    }

    console.log("-----------------------------------");
    console.log("🎉 All Done.");
}

main();
