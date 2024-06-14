class PeerService {
    constructor() {
        this.initializePeer();
    }

    initializePeer() {
        this.peer = new RTCPeerConnection({
            iceServers: [
                {
                    urls: [
                        "stun:stun1.l.google.com:19302",
                        "stun:stun2.l.google.com:19302"
                    ],
                }
            ]
        });
    }

    async getAnswer(offer) {
        if (this.peer.signalingState === 'closed') {
            this.initializePeer();
        }
        await this.peer.setRemoteDescription(offer);
        const ans = await this.peer.createAnswer();
        await this.peer.setLocalDescription(new RTCSessionDescription(ans));
        return ans;
    }

    async getOffer() {
        if (this.peer.signalingState === 'closed') {
            this.initializePeer();
        }
        const offer = await this.peer.createOffer();
        await this.peer.setLocalDescription(new RTCSessionDescription(offer));
        return offer;
    }

    async setLocalDescription(ans) {
        if (this.peer.signalingState === 'closed') {
            this.initializePeer();
        }
        await this.peer.setRemoteDescription(new RTCSessionDescription(ans));
    }
}

const peerServiceInstance = new PeerService();
export default peerServiceInstance;
