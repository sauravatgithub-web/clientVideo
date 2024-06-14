import React, { createContext, useContext, useMemo } from'react';
import {io} from 'socket.io-client'
const server = process.env.REACT_APP_SERVER_URL;
console.log(server);

const SocketContext = createContext(null);

const useSocket = () => useContext(SocketContext);

const SocketProvider = (props) => {
    const socket = useMemo(() => io(server, { withCredentials: true }), [])
    return (
        <SocketContext.Provider value = {socket}>
            {props.children}
        </SocketContext.Provider>
    )
}

export { useSocket, SocketProvider }

