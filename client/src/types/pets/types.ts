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
    files?: (File | string)[];
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

export interface FileWithMeta {
    id: string;
    date: Date,
    customName: string;
    file: File;
}

export type MaskPattern = 'date' | 'phone' | 'numeric' | RegExp | ((value: string) => string);