import { MongoClient } from 'mongodb'
import type {friendsModel, personasModel} from "./types.ts";
import {fromModeltoPersona, fromModeltoFriends} from "./utils.ts";

const MONGO_URL = Deno.env.get("MONGO_URL");

if(!MONGO_URL){
  console.error("Mongo url is not set")
  Deno.exit(1);
}
const client = new MongoClient(MONGO_URL);
await client.connect();

// Database Name
const db = client.db("Personas");

const personasCollection = db.collection<personasModel>("personas");
const friendsCollection = db.collection<friendsModel>("friends");

const handler = async (req:Request): Promise<Response> =>{
  const method = req.method;
  const url = new URL (req.url);
  const path = url.pathname;

  if(method === "GET"){
    if(path === "/personas"){
      const name = url.searchParams.get("name");
      if(name){
        const personasDB = await personasCollection.find({name}).toArray();
        const personas = await Promise.all(
          personasDB.map((p) => fromModeltoPersona(p, friendsCollection))
        );
        return new Response(JSON.stringify(personas));
      } else {
        const personasDB = await personasCollection.find().toArray();
        const personas = await Promise.all(
          personasDB.map((p) => fromModeltoPersona(p, friendsCollection))
        );
        return new Response(JSON.stringify(personas));
      }
    } else if(path === "/persona"){
        const email = url.searchParams.get("email");
        if(!email) return new Response("Bad request", {status:400});

        const personaDB = await personasCollection.findOne({
          email,
        });

        if(!personaDB) return new Response ("Persona no encontrada",{status:404});
        const user = await fromModeltoPersona(personaDB, friendsCollection);
        return new Response(JSON.stringify(user));
    }
  } else if(method === "POST"){
    if(path === "/persona"){
      const persona = await req.json();

      if(!persona.name || !persona.email || !persona.tlfno|| !persona.amigos){
        return new Response ("Bad request", {status:400});
      }
      // comprobar el email y tlfno
      const personaDBemail = await personasCollection.findOne({
        email:persona.email,
      });

      const personaDBtlfno = await personasCollection.findOne({
        tlfno:persona.tlfno,
      });

      if(personaDBemail || personaDBtlfno) return new Response("User already exists", {status:409});

      const {insertedId } = await personasCollection.insertOne({
        name: persona.name,
        email: persona.email,
        tlfno: persona.tlfno,
        amigos: persona.amigos,
      });

      return new Response (
        JSON.stringify({
          name: persona.name,
          email: persona.email,
          tlfno: persona.tlfno,
          amigos: [],
          id: insertedId,
        }), {status:201}
      );

    }

  } else if(method === "PUT"){
    if(path === "/persona"){
      const persona = await req.json();
      if(!persona.name || !persona.email || !persona.tlfno|| !persona.amigos){
        return new Response ("Bad request", {status:400});
      }

      // comprobar el email 
      const personaDBemail = await personasCollection.findOne({
        email:persona.email,
      });

      // comprobar el email 
      const personaDBtlfno = await personasCollection.findOne({
        tlfno:persona.tlfno,
      });

      if(personaDBemail|| personaDBtlfno) return new Response("User already exists", {status:409});
      /*
      const {modifiedCount } = await personasCollection.updateOne({
        {email: persona.email, tlfno: persona.tlfno},
        {$set: {name: persona.name, }}
      })
        */


    } else if(path === "/persona/friend"){

    }

  } else if(method === "DELETE"){
    if(path === "/persona"){
      const email = url.searchParams.get("email");
      if(!email) return new Response ("Bad request",{status:400});

      const { deletedCount } = await personasCollection.deleteOne({
        email: email,
      });

      if(deletedCount === 0){
        return new Response ("Email not found", {status: 404})
      }
;
      return new Response ("OK", {status: 200})
    }
  }

  return new Response ("endpoint not found", {status: 404});
}

Deno.serve({ port: 3000 }, handler);