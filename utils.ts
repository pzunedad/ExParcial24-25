import type { Collection } from "mongodb";
import type {friendsModel,Friends,personas, personasModel} from "./types.ts";

export const fromModeltoPersona = async (
    personaDB: personasModel,
    friendsCollection: Collection<friendsModel>
): Promise<personas> => {
    const friends = await friendsCollection
        .find({_id: {$in: personaDB.amigos}})
        .toArray();
    
    return{
        id: personaDB._id!.toString(),
        name: personaDB.name,
        email: personaDB.email,
        tlfno: personaDB.tlfno,
        amigos: friends.map((f) => fromModeltoFriends(f)),
    };
};

export const fromModeltoFriends = (model: friendsModel): Friends => ({
    id: model!._id!.toString(),
    name: model.name,
    email: model.email,
    tlfno: model.tlfno,
})