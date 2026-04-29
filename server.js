const net = require("node:net");

const clients = new Map();

function broadcast(message, senderSocket = null) {
    for (const client of clients.values()) {
        if (client !== senderSocket) {
            client.write(`${senderSocket.username} says: `, message);
        }
    }
}

const server = net.createServer((socket) => {
    console.log(clients.size);
    if (clients.size >= 5) {
        socket.write("Server full (max 5 clients)\n");
        socket.destroy();
        return;
    }

    console.log("Client Connected");

    socket.username = null;
    socket.write("Enter your name");

    socket.on("data", (data) => {
        if (!socket.username) {
            const name = data.toString().trim();

            if (!name) {
                socket.write("*** System: Name must be non-empty\n");
                return;
            }

            if (clients.has(name)) {
                socket.write("*** System: Username already taken\n");
                return;
            }

            clients.set(name, socket);
            socket.username = name;
            socket.write(`*** System: Welcome ${name}\n`);

            for (const client of clients.values()) {
                if (client !== socket) {
                    client.write(`*** System: ${name} joined the chat\n`);
                }
            }

            return;
        }

        const message = data.toString().trim();
        if (message.startsWith("/dm ")) {
            const parts = message.split(" ");

            if (parts.length < 3) {
                socket.write("*** System: Usage: /dm <username> <message>\n");
                return;
            }

            const targetClient = parts[1];
            const dmMessage = parts.slice(2).join(" ");

            const targetSocket = clients.get(targetClient);

            if (!targetSocket) {
                socket.write(`*** System: User "${targetClient}" not found\n`);
                return;
            }

            targetSocket.write(
                `(Private from ${socket.username}): ${dmMessage}\n`,
            );
            return;
        }

        broadcast(message, socket);
    });

    socket.on("close", () => {
        console.log(`${socket.username} disconnected`);
    });
});

server.listen(3000, "localhost", () => {
    console.log("Server listening in 3000 port");
});
