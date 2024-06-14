import React, { useCallback, useEffect, useState } from 'react'
import { useSocket } from '../context/SocketProvider'
import ReactPlayer from 'react-player'
import peer from '../service/peer'
import { useNavigate } from 'react-router-dom'

const Room = () => {
    const socket = useSocket();
    const navigate = useNavigate();
    const [remoteSocketId, setRemoteSocketId] = useState(null);
    const [myStream, setMyStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);

    const handleUserJoined = useCallback(({email, id}) => {
        console.log(email, id);
        setRemoteSocketId(id);
    }, [])

    const handleCallUser = useCallback(async() => {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });

        const offer = await peer.getOffer();
        socket.emit("user-call", { to: remoteSocketId, offer });
        setMyStream(stream);
    }, [socket, remoteSocketId])

    const handleEndCall = useCallback(() => {
        if (window.confirm("Are you sure you want to end the call?")) {
            if (myStream) {
                myStream.getTracks().forEach(track => {
                    track.stop();
                });
            }

            socket.emit('end-call', { to: remoteSocketId });

            if (peer.peer) {
                peer.peer.close();
                peer.initializePeer();
            }

            setRemoteStream(null);
            setMyStream(null);
            navigate('/');
        }
    }, [myStream, navigate, setRemoteStream, setMyStream, remoteSocketId, socket])

    const handleEnd = useCallback(() => {
        if (myStream) {
            myStream.getTracks().forEach(track => {
                track.stop();
            });
        }

        if (peer.peer) {
            peer.peer.close();
            peer.initializePeer();
        }

        setRemoteStream(null);
        setMyStream(null);
        navigate('/');
    }, [myStream, navigate])

    const handleIncomingCall = useCallback(async({from, offer}) => {
        setRemoteSocketId(from);
        console.log(`Incoming call from ${from}`, offer);
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        setMyStream(stream);

        const ans = await peer.getAnswer(offer)
        socket.emit('call-accepted', { to: from, ans });
    }, [socket])

    const sendStreams = useCallback(() => {
        for (const track of myStream.getTracks()) {
            peer.peer.addTrack(track, myStream);
        }
    },[myStream])

    const handleCallAccepted = useCallback(({ from, ans }) => {
        console.log(ans);
        peer.setLocalDescription(ans);
        console.log("Call Accepted");
        sendStreams();
    }, [sendStreams]);

    const handleNegotiationNeeded = useCallback(async() => {
        const offer = await peer.getOffer();
        socket.emit('peer-negotiation-needed', { offer, to: remoteSocketId });
    }, [remoteSocketId, socket])

    const handleIncomingNegotiation = useCallback(async({from, offer}) => {
        const ans = await peer.getAnswer(offer);
        socket.emit('peer-negotiation-done', { to: from, ans });
    }, [socket]);

    const handleNegotiationFinal = useCallback(async({ ans }) => {
        await peer.setLocalDescription(ans);
    }, [])

    useEffect(() => {
        peer.peer.addEventListener('negotiationneeded', handleNegotiationNeeded);
        return () => {
            peer.peer.removeEventListener("negotiationneeded", handleNegotiationNeeded);
        }
    }, [handleNegotiationNeeded])

    useEffect(() => {
        peer.peer.addEventListener('track', async (ev) => {
            const remoteStream = ev.streams;
            console.log("got tracks");
            setRemoteStream(remoteStream[0]);
        })
    }, [])

    useEffect(() => {
        socket.on('user-joined', handleUserJoined);
        socket.on('incoming-call', handleIncomingCall);
        socket.on("call-accepted", handleCallAccepted);
        socket.on('peer-negotiation-needed', handleIncomingNegotiation);
        socket.on('peer-negotiation-final', handleNegotiationFinal);
        socket.on('end-call', handleEnd);
        return() => {
            socket.off('user-joined', handleUserJoined);
            socket.off('incoming-call', handleIncomingCall);
            socket.off("call-accepted", handleCallAccepted);
            socket.off('peer-negotiation-needed', handleIncomingNegotiation);
            socket.off('peer-negotiation-final', handleNegotiationFinal);
            socket.off('end-call', handleEnd);
        }
    }, [socket, handleUserJoined, handleIncomingCall, handleCallAccepted, handleIncomingNegotiation, handleNegotiationFinal, handleEnd]);

    return (
        <div>
            <h1>Room Page</h1>
            <h4>{ remoteSocketId ? "Connected" : "No one in room" }</h4>
            {myStream && <button onClick={sendStreams}>Send Stream</button>}
            {remoteSocketId && <button onClick = {handleCallUser}>Call</button>}
            {remoteStream && <button onClick = {handleEndCall}>End call</button>}
            {
                myStream && (
                <>
                    <h1>My Stream</h1>
                    <ReactPlayer height = "300px" width = "500px" url = {myStream} playing muted/>
                </>)
            }   
            {
                remoteStream && (
                <>
                    <h1>Remote Stream</h1>
                    <ReactPlayer height = "300px" width = "500px" url = {remoteStream} playing muted/>
                </>)
            }   
        </div>
    )   
}

export default Room
