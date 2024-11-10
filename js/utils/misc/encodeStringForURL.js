export const encodeStringForURL = (str) => {
    str = str.replace(/[^a-zA-Z0-9-_.~]/g, function(char) {
        return encodeURIComponent(char);
    });
    str = str.replace(/%20/g, '+');
    return str;
};