import fs from 'fs/promises'
export const fileExists = async (filePath: string) => {
    return fs.access(filePath, fs.constants.F_OK)
        .then(() => true)
        .catch(() => false)
}