// database string giver

const databaseString= ():string => {
    let mode = process.env.MODE
    let devDb = process.env.DEVELOPMENT_DATABASE_URL
    let prodDb = process.env. PRODUCTION_DATABASE_URL
    if(!mode || !devDb || !prodDb){
        throw new Error("env is not set upped correctly")
    }
    
    let databaseUrl:string;
    databaseUrl = process.env.MODE == "DEVELOPMENT" ? process.env.DEVELOPMENT_DATABASE_URL!  : process.env. PRODUCTION_DATABASE_URL!
    return databaseUrl;
}
export default databaseString;