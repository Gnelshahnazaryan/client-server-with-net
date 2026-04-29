const net = require("node:net");

const client = net.createConnection({ port: 3000, host: "localhost" }, () => {
    console.log("Connected to server");
});

client.on("data", (data) => {
    console.log("Server says: ", data.toString());
});

process.stdin.on("data", (data) => {
    client.write(data.toString());
});

client.on("end", () => {
    console.log("Disconnected from server");
});

client.on("error", (err) => {
    console.log(err.message);
});