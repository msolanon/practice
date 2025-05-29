function extractErrorCode(str) {
    let secondOccurence = '';
    let firstOccurence = '';
    const delimiter = '___'; //Replace it with the delimiter you used in the Solidity Contract.
    firstOccurence = str.indexOf(delimiter);
    if (firstOccurence == -1) {
        return "An error occured";
    }

    secondOccurence = str.indexOf(delimiter, firstOccurence + 1);
    if (secondOccurence == -1) {
        return "An error occured";
    }

    //Okay so far
    return str.substring(firstOccurence + delimiter.length, secondOccurence);
}

module.exports = {
    extractErrorCode
}   