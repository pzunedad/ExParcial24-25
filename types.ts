import { ObjectId, type OptionalId } from "mongodb";

export type personasModel = OptionalId<{
    name:string,
    email:string,
    tlfno: number,
    amigos: ObjectId[],
}>;

export type personas = {
    id:string,
    name:string,
    email:string,
    tlfno: number,
    amigos: Friends[],
};

export type Friends = {
    id:string,
    name:string,
    email:string,
    tlfno: number,
}

export type friendsModel = OptionalId<{
    name:string,
    email:string,
    tlfno: number,
}>;