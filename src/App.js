import React from 'react';
import socket from './socket';
import JoinBlock from './components/login';
import reducer from './reducer';
import Chat from './components/Chat';
import axios from 'axios';


function App() {
  const [state, dispatch] = React.useReducer(
    reducer,
    {
      joined: false,
      roomId: null,
      userName: null,
      users: [],
      messages: []
    }
  );

  const onAddMessage = (message) => {
    dispatch({
      type: 'NEW_MESSAGE',
      payload: message
    })
  };

  const onLogin = async (obj) => {
    dispatch({
      type: 'JOINED',
      payload: obj
    });
    socket.emit('ROOM.JOIN', obj);
    const { data } = await axios.get(`/rooms/${obj.roomId}`);
    setUsers(data.users);
  };

const setUsers = (users) => {
  dispatch({
    type: 'SET_USERS',
    payload: users
  });
};

  React.useEffect(() => {
    socket.on('ROOM.SET_USERS', setUsers);
    socket.on('ROOM.NEW_MESSAGE', message => {
      onAddMessage(message);
    });
  }, [0]);


  return (
  <div className="App"> 
    {!state.joined ? 
    <JoinBlock onLogin={onLogin} /> : 
    <Chat {...state} onAddMessage={onAddMessage} />}
  </div>
  );
}

export default App;
