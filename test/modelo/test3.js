import model from "tabla-model";
const test1 = new model("test3", [
    {
        name: "id",
        type: "int",
        primary: true,
        autoincrement: true
    },
    {
        name: "row1",
        type: "text"
    },
    {
        name: "row2",
        type: "int",
    },
    {
        name: "row3",
        type: "text",
    }
]);
test1.foreingKey({
    key: "row2",
    reference: "test4",
    keyReference: "id_key2",
    onUpdate: 'CASCADE',
    onDelete: 'NO ACTION'
});
export default test1;
