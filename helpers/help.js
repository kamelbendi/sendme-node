
exports.getRandomInt = (min, max)=>{
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

exports.generateRandomDigitsNumber = (length)=>{
    let result = '';
    for (let i = 0; i < length; i++) {
        result += Math.floor(Math.random() * 10);
    }
    return result;
};

exports.getCurrentDate=()=>{
    return new Date();
};

exports.isValidFieldProvided=(arrayKeys1, arrayKeys2)=>{
    if (arrayKeys1.length !== arrayKeys2.length) {
        return false;
    }

    for (let key of arrayKeys1) {
        if (!arrayKeys2.includes(key)) {
            return false;
        }
    }

    return true;
};

exports.generateExpiryDate=()=>{
    const currentDate = new Date();
    const expiryDate = new Date(currentDate.getFullYear() + 5, currentDate.getMonth());
  
    const formattedExpiryDate = `${(expiryDate.getMonth() + 1).toString().padStart(2, '0')}/${expiryDate.getFullYear()}`;
    
    return formattedExpiryDate;
}
