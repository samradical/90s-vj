import IO from 'socket.io-client'

const SOCKET = (() => {
    const socket = IO(SERVER_BASE)
    socket.on('handshake', (data) => {
    });

    return socket

})()

export default SOCKET