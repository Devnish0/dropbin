import { cookies } from "next/headers"
import { cookieName } from "./constants";
import { db } from "@/db";
import { users } from "@/db/schema";

const getOrCreateSession= async ()=>{
    const cookieStore = await cookies();
    
    const sessionCookie =  cookieStore.get(cookieName)

    if(!sessionCookie || !sessionCookie.value){
        const [{id}] = await db.insert(users).values({}).returning({id : users.id})

        cookieStore.set(cookieName,id,{
            httpOnly:true,
            secure: process.env.NODE_ENV == "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 365,
            path: "/"
        })

        return id;
    }

    return sessionCookie.value;
}

export default getOrCreateSession;