import React, { useRef, useState } from "react";
import './App.css';

import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";

import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";

firebase.initializeApp({
    apiKey: "AIzaSyBtB8aT6Zv2dUkOIdymOR2dljZvtV6GZWQ",
    authDomain: "chatapp-663e5.firebaseapp.com",
    projectId: "chatapp-663e5",
    storageBucket: "chatapp-663e5.appspot.com",
    messagingSenderId: "64149351091",
    appId: "1:64149351091:web:78f8c02d9edbeb82405ec6"
})

const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {
  const [user] = useAuthState(auth);
  return (
    <div className="App">
      <header>
        <SignOut />
      </header>

      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>

    </div>
  );
}

function SignIn(){
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }
  return(
    <div>
      <button onClick={signInWithGoogle} >Sign In with Google</button>
    </div>
  )
}

function SignOut(){
  return auth.currentUser &&(
    <button onClick = {() => auth.signOut()} >Sign Out</button>
  )
}

function ChatRoom(){
  const dummy = useRef();

  const messageRef = firestore.collection("messages");
  const query = messageRef.orderBy("createdAt").limit(25);
  const [messages] = useCollectionData(query, { idField: 'id' });
  const [formValue, setFormValue] = useState(" ");
  const sendMessage = async(e) => {
    e.preventDefault();
    const {uid, photoURL} = auth.currentUser;
    await messageRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    })
    setFormValue('');
    dummy.current.scrollIntoView({behavior : "smooth"});
  }

  return (<>
    <main>
      {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
      <span ref={dummy}></span>
    </main>
    <form onSubmit={sendMessage}>
      <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="say something nice" />
      <button type="submit" disabled={!formValue}>Send</button>
    </form>
  </>)

}

function ChatMessage(props){
  const {text,uid,photoURL} = props.message;

  const messageClass = uid === auth.currentUser.uid ? "send" : "recieve";

  return(
    <div className = {`message ${messageClass}`}>
      <img src={photoURL} alt={uid} />
      <p>{text}</p>
    </div>
  )
}

export default App;
