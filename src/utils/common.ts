// 保留小数点一位
export const toFixed = (num: string, fractionDigits = 1) => {
    const numFloat = parseFloat(num)
    return numFloat.toFixed(fractionDigits)
};


// 从id转到chrome extension url
export const getChromeExtensionUrl = (id: string) => {
    return `https://chrome.google.com/webstore/detail/${id}`
}