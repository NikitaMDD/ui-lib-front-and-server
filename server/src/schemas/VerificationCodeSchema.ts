import mongoose, { Schema, Document } from "mongoose";

export interface IVerificationCode extends Document {
    userId: mongoose.Types.ObjectId;
    code: string;
    expiresAt: Date;
    isUsed: boolean;
    createdAt: Date;
}

const VerificationCodeSchema: Schema = new Schema({
    userId: { 
        type: Schema.Types.ObjectId, 
        ref: "User", 
        required: true,
        index: true 
    },
    code: { 
        type: String, 
        required: true 
    },
    expiresAt: { 
        type: Date, 
        required: true,
        index: true 
    },
    isUsed: { 
        type: Boolean, 
        default: false 
    },
    createdAt: { 
        type: Date, 
        default: Date.now,
        expires: 86400
    }
});

VerificationCodeSchema.index({ userId: 1, isUsed: 1, expiresAt: 1 });

export default mongoose.model<IVerificationCode>("VerificationCode", VerificationCodeSchema);