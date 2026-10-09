import { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

function App() {
  const [roomId, setRoomId] = useState('ai-room-1');
  const [joined, setJoined] = useState(false);
  const [notes, setNotes] = useState([]);
  const [noteInput, setNoteInput] = useState('');
  const [summary, setSummary] = useState('');

  const localVideo = useRef();
  const remoteVideo = useRef();
  const peerRef = useRef();
  const localStream = useRef();

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
      localStream.current = stream;
      if(localVideo.current) localVideo.current.srcObject = stream;
    });
    socket.on('user-joined', async (userId) => {
      peerRef.current = new RTCPeerConnection();
      localStream.current.getTracks().forEach(track => peerRef.current.addTrack(track, localStream.current));
      const offer = await peerRef.current.createOffer();
      await peerRef.current.setLocalDescription(offer);
      socket.emit('signal', { roomId, signal: offer, to: userId });
      peerRef.current.onicecandidate = e => {
        if(e.candidate) socket.emit('signal', { roomId, signal: e.candidate, to: userId });
      }
      peerRef.current.ontrack = e => { remoteVideo.current.srcObject = e.streams[0]; }
    });
    socket.on('signal', async ({ signal, from }) => {
      if(signal.type === 'offer'){
        peerRef.current = new RTCPeerConnection();
        localStream.current.getTracks().forEach(track => peerRef.current.addTrack(track, localStream.current));
        await peerRef.current.setRemoteDescription(signal);
        const answer = await peerRef.current.createAnswer();
        await peerRef.current.setLocalDescription(answer);
        socket.emit('signal', { roomId, signal: answer, to: from });
        peerRef.current.ontrack = e => { remoteVideo.current.srcObject = e.streams[0]; }
        peerRef.current.onicecandidate = e => {
          if(e.candidate) socket.emit('signal', { roomId, signal: e.candidate, to: from });
        }
      } else if(signal.type === 'answer'){
        await peerRef.current.setRemoteDescription(signal);
      } else if(signal.candidate){
        try { await peerRef.current.addIceCandidate(signal); } catch {}
      }
    });
    socket.on('ai-note', (note) => setNotes(prev => [...prev, note]));
  }, [roomId]);

  const joinRoom = () => { socket.emit('join-room', roomId); setJoined(true); };
  const addNote = () => { if(!noteInput) return; socket.emit('ai-note', { roomId, note: noteInput }); setNoteInput(''); };
  const generateSummary = () => {
    if(notes.length === 0){ setSummary('No notes yet!'); return; }
    setSummary(`AI SUMMARY (${notes.length} points):\n- ${notes.join('\n- ')}\n\nAction Items: Follow up on discussed points.`);
  };

  if(!joined){
    return (
      <div style={{height:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',background:'#0f172a',color:'white'}}>
        <h1 style={{fontSize:'40px'}}>🎥 AI Meeting Platform</h1>
        <p>Video + AI Notes + Auto Summary</p>
        <input value={roomId} onChange={e=>setRoomId(e.target.value)} placeholder="Room ID" style={{padding:'12px',margin:'20px',width:'250px',borderRadius:'8px',border:'none'}}/>
        <button onClick={joinRoom} style={{padding:'12px 30px',background:'#8b5cf6',color:'white',border:'none',borderRadius:'8px',cursor:'pointer',fontSize:'16px'}}>Join Meeting</button>
      </div>
    )
  }
  return (
    <div style={{display:'flex',height:'100vh',background:'#0f172a',color:'white'}}>
      <div style={{flex:2,padding:'20px'}}>
        <h2>Room: {roomId} | AI Meeting LIVE</h2>
        <div style={{display:'flex',gap:'15px',marginTop:'15px'}}>
          <video ref={localVideo} autoPlay muted playsInline style={{width:'48%',background:'black',borderRadius:'12px',border:'2px solid #8b5cf6'}}></video>
          <video ref={remoteVideo} autoPlay playsInline style={{width:'48%',background:'black',borderRadius:'12px',border:'2px solid #22d3ee'}}></video>
        </div>
      </div>
      <div style={{flex:1,background:'white',color:'black',padding:'20px',display:'flex',flexDirection:'column'}}>
        <h3>📝 AI Notes</h3>
        <div style={{flex:1,overflowY:'auto',border:'1px solid #e2e8f0',borderRadius:'8px',padding:'10px',margin:'10px 0'}}>
          {notes.map((n,i)=><div key={i} style={{background:'#f1f5f9',padding:'8px',borderRadius:'6px',marginBottom:'6px'}}>• {n}</div>)}
        </div>
        <input value={noteInput} onChange={e=>setNoteInput(e.target.value)} placeholder="Type key point + Enter" onKeyDown={e=>e.key==='Enter'&&addNote()} style={{padding:'10px',borderRadius:'6px',border:'1px solid #cbd5e1'}}/>
        <button onClick={addNote} style={{marginTop:'8px',padding:'10px',background:'#8b5cf6',color:'white',border:'none',borderRadius:'6px'}}>Add Note</button>
        <button onClick={generateSummary} style={{marginTop:'8px',padding:'10px',background:'#0f172a',color:'white',border:'none',borderRadius:'6px'}}>✨ Generate AI Summary</button>
        {summary && <div style={{marginTop:'10px',background:'#fef9c3',padding:'10px',borderRadius:'6px',whiteSpace:'pre-wrap',fontSize:'13px'}}>{summary}</div>}
      </div>
    </div>
  )
}
export default App;