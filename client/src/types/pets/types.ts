/** Файл, пришедший с API (поддокумент в Mongo). */
export interface PetFileApi {
    _id?: string;
    url?: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    uploadedAt: string;
}

export interface Pet {
    _id: string;
    name: string;
    type: string;
    dateOfBirth: string;
    presenceOfAStamp: boolean;
    vaccination: boolean;
    treatmentForEctoparasites: boolean;
    treatmentForHelminths: boolean;
    sterilization: boolean;
    files?: PetFileApi[];
}

export interface PetFormData {
    name: string;
    type: string;
    dateOfBirth: string;
    presenceOfAStamp: string;
    vaccination: string;
    treatmentForEctoparasites: string;
    treatmentForHelminths: string;
    sterilization: string;
    files: FileWithMeta[];
}

interface CommonFields {
    label: string;
    placeholder: string;
    required: boolean;
    errors?: string;
}

interface InputFields extends CommonFields {
    type: 'input';
    key: 'name';
    mask?: MaskPattern;
}

interface DropdownFields extends CommonFields {
    type: 'dropdown';
    key: 'type' | 'presenceOfAStamp' | 'vaccination' | 'treatmentForEctoparasites' | 'treatmentForHelminths' | 'sterilization';
    options: string[];
}

interface DateFields extends CommonFields {
    type: 'date';
    key: 'dateOfBirth';
    mask?: 'date';
}

interface FileFields extends CommonFields {
    type: 'fileLoader';
    key: 'files';
}

export type FormFields = InputFields | DropdownFields | DateFields | FileFields;

/** Метаданные файла, уже сохранённые в Mongo — отправлять обратно при PUT без placeholder File. */
export interface PreservedServerFile {
    url?: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    uploadedAt: Date | string;
}

export interface FileWithMeta {
    id: string;
    date: Date;
    customName: string;
    file: File;
    preservedServerFile?: PreservedServerFile;
}

export type MaskPattern = 'date' | 'phone' | 'numeric' | RegExp | ((value: string) => string);