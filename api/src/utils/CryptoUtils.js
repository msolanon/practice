const CryptoJS = require('crypto-js');

const CryptoUtils = {
    // Decrypt Data with Private Key
    decrypt: (privateKey, cypherText) => {
        try {
            const bytes = CryptoJS.AES.decrypt(cypherText, privateKey);
            if (bytes.sigBytes > 0) {
                const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
                console.log('Decryption successful');
                return decryptedData;
            }
        } catch (error) {
            throw new Error('Decryption failed');
        }
    },

    encrypt: (privateKey, data) => {
        try {
            const encryptedData = CryptoJS.AES.encrypt(data, privateKey).toString();
            console.log('Encryption successful');
            return encryptedData;
        } catch (error) {
            throw new Error('Encryption failed');
        }
    },

};

module.exports = CryptoUtils;