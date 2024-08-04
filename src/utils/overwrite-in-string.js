
export default (str, start, end, replacement) => {
return str.slice(0, start) + replacement + str.slice(end);
}