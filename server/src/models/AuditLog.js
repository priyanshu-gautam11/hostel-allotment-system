import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
    {
        actorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        actorType: {
            type: String,
            enum: ["user", "system"],
            default: "user",
        },

        action: {
            type: String,
            required: true,
            trim: true,
        },

        entityType: {
            type: String,
            required: true,
        },

        entityId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },

        before: {
            type: mongoose.Schema.Types.Mixed,
            default: undefined,
        },

        after: {
            type: mongoose.Schema.Types.Mixed,
            default: undefined,
        },
    },
    { timestamps: true }
);

// Audit logs are append-only.

const AuditLog = mongoose.model("AuditLog", auditLogSchema);

export default AuditLog;