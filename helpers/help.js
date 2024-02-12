exports.getRandomInt = (min, max)=>{
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
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
