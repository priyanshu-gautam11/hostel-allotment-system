import mongoose from "mongoose";

import { connectDB } from "../config/db.js";

import Hostel from "../models/Hostel.js";
import Room from "../models/Room.js";
import Bed from "../models/Bed.js";

const seedDatabase = async () => {
    try {
        // Connect to MongoDB
        await connectDB();

        console.log("Starting database seeding...");

        // Clear existing data
        await Hostel.deleteMany({});
        await Room.deleteMany({});
        await Bed.deleteMany({});

        console.log("Old hostel, room and bed data cleared.");

        const hostels = [];

        // Create hostel definitions
        for (let i = 1; i <= 6; i++) {
            const isTriple = i === 6;

            hostels.push({
                name: `Hostel ${String.fromCharCode(64 + i)}`,
                type: isTriple ? "triple" : "single",
                totalRooms: isTriple ? 90 : 32,
                totalBeds: isTriple ? 270 : 32,
                fillOrder: i,
                active: true,
            });
        }

        // Insert hostels
        const createdHostels = await Hostel.insertMany(hostels);

        console.log("6 hostels created.");

        const roomDocuments = [];
        const bedDocuments = [];

        // Generate rooms and beds
        for (const hostel of createdHostels) {
            const roomCount = hostel.totalRooms;

            const capacity = hostel.type === "single" ? 1 : 3;

            for (let roomNumber = 1; roomNumber <= roomCount; roomNumber++) {
                const roomsPerFloor = hostel.type === "triple" ? 30 : 8;
                const floor = Math.floor((roomNumber - 1) / roomsPerFloor);
                roomDocuments.push({
                    hostelId: hostel._id,
                    roomNumber,
                    floor,
                    capacity,
                });
            }
        }

        // Insert all rooms
        const createdRooms = await Room.insertMany(roomDocuments);

        console.log(`${createdRooms.length} rooms created.`);

        // Generate beds for each room
        for (const room of createdRooms) {
            for (let bedNumber = 1; bedNumber <= room.capacity; bedNumber++) {
                bedDocuments.push({
                    roomId: room._id,
                    hostelId: room.hostelId,
                    bedNumber,
                    status: "available",
                    currentStudentId: null,
                });
            }
        }

        // Insert all beds
        await Bed.insertMany(bedDocuments);

        console.log(`${bedDocuments.length} beds created.`);

        // Final counts
        const hostelCount = await Hostel.countDocuments();
        const roomCount = await Room.countDocuments();
        const bedCount = await Bed.countDocuments();

        console.log("\n========== SEED SUMMARY ==========");
        console.log("Hostels:", hostelCount);
        console.log("Rooms:", roomCount);
        console.log("Beds:", bedCount);
        console.log("==================================");

    } catch (error) {
        console.error("Database seeding failed:", error.message);
        process.exitCode = 1;

    } finally {
        await mongoose.disconnect();
        console.log("MongoDB disconnected.");
    }
};

seedDatabase();