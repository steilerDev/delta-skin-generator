export const Log = {
    log: (msg: string) => {
        console.log(msg);
    },
    debug: (msg: string) => {
        Log.log(`DEBUG: ${msg}`);
    },
    info: (msg: string) => {
        Log.log(`INFO: ${msg}`);
    },
    warn: (msg: string) => {
        Log.log(`WARN: ${msg}`);
    },
    error: (msg: string) => {
        Log.log(`ERROR: ${msg}`);
    },
};