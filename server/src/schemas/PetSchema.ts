import mongoose, {Document, Model, Schema} from "mongoose";

// Интерфейс для метаданных файла
interface IPetFile {
    url: string; // Ссылка на то где будет храниться файл
    fileName: string;
    fileSize: number;
    mimeType: string; // Тип файла
    uploadedAt: Date;
}

interface IPet extends Document {
    name: string;
    type: string;
    dateOfBirth: Date;
    presenceOfAStamp: boolean;
    vaccination: boolean;
    treatmentForEctoparasites: boolean;
    treatmentForHelminths: boolean;
    sterilization: boolean;
    files: IPetFile[];
    createdAt: Date;
    updatedAt: Date;
}

interface IPetCreate {
    name: string;
    type: string;
    dateOfBirth: Date | null;
    vaccination: boolean;
    treatmentForEctoparasites: boolean;
    treatmentForHelminths: boolean;
    sterilization: boolean;
    files?: IPetFile[];
}

const PetSchema: Schema<IPet> = new Schema(
    {
        name: {type: String, required: true, trim: true},
        type: {type: String, required: true, trim: true},
        dateOfBirth: {type: Date, required: true},
        presenceOfAStamp: {type: Boolean, required: true, default: false},
        vaccination: {type: Boolean, required: true, default: false},
        treatmentForEctoparasites: {type: Boolean, required: true, default: false},
        treatmentForHelminths: {type: Boolean, required: true, default: false},
        sterilization: {type: Boolean, required: true, default: false},
        files: {
            type: [
                {
                    url: {type: String,},
                    fileName: {type: String, required: true},
                    fileSize: {type: Number, required: true},
                    mimeType: {type: String, required: true},
                    uploadedAt: {type: Date, default: Date.now},
                }
            ],
            default: [],
        },
    },
    {
        timestamps: true,
    }
)

const Pet: Model<IPet> = mongoose.model<IPet>('Pet', PetSchema);

export {Pet, IPet, IPetCreate, PetSchema};