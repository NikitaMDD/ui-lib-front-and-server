import {Pet, IPet, IPetCreate, PetSchema} from "../schemas/PetSchema";

class PetsService {

    async getAll() {
        const pets: IPet[] = await Pet.find();
        return pets;
    }

    async create(pet: IPet) {
        const newPet: IPet = await Pet.create({...pet});
        return newPet;
    }

    async update(id: string | string[], pet: IPet) {
        if (!id) {
            throw new Error('id созданного документа не передан');
        }
        const updatedPet: IPet | null = await Pet.findByIdAndUpdate(id, pet, {new: true, runValidators: true });
        return updatedPet;
    }

    async delete(id: string | string[]) {
        if (!id) {
            throw new Error("id не передан");
        }
        const pet = await Pet.findByIdAndDelete(id);
        return pet;
    }

}

export default new PetsService();