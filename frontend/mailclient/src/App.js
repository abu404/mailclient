import React from 'react';
import Login from './components/Login'
import MailList from './components/MailList';
import {Route, Switch } from 'react-router-dom';

import './App.css';


function App() {
  return (
    <main>
      <Switch>
        <Route path="/list" exact component={MailList}></Route>
        <Route path="/login"  component={Login}></Route>
        <Route path="/" exact component={Login}></Route>
      </Switch>
    </main>
    
  );
}

export default App;
