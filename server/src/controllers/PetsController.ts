import {Request, Response} from "express";
import PetsServices from "../services/PetsServices";
import {IPet, IPetCreate} from "../schemas/PetSchema";

class PetsController {
    async getAll(req: Request, res: Response) {
        try {
            const pets: IPet[] = await PetsServices.getAll();
            return res.json(pets);
        } catch (e: any) {
            res.status(500).json({message: e.message});
        }
    }

    async create(req: Request, res: Response) {
        try {
            const pet: IPetCreate = await PetsServices.create(req.body);
            return res.json(pet);
        } catch (e: any) {
            res.status(500).json({message: e.message});
        }
    }

    async update(req: Request, res: Response) {
        try {
            const {id} = req.params;
            const updatedPet: IPet | null = await PetsServices.update(id, req.body);
            return res.json(updatedPet);
        } catch (e: any) {
            res.status(500).json({message: e.message});
        }
    }

    async delete(req: Request, res: Response) {
        try {
            const deletedPet = await PetsServices.delete(req.params.id);
            return res.json(deletedPet);
        } catch (e: any) {
            res.status(500).json({message: e.message});
        }
    }
}

export default new PetsController();