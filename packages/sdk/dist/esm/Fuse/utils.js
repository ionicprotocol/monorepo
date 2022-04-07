import Filter from "bad-words";
export function filterOnlyObjectProperties(obj) {
    return Object.fromEntries(Object.entries(obj).filter(([k]) => isNaN(k)));
}
export const filter = new Filter({ placeHolder: " " });
filter.addWords(...["R1", "R2", "R3", "R4", "R5", "R6", "R7"]);
export const filterPoolName = (name) => {
    return filter.clean(name);
};
