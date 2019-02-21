import React, { Component } from 'react';
import { BrowserRouter as Router , Route } from 'react-router-dom';
import store from './store';
import { Provider } from 'react-redux';
import jwt_decode from 'jwt-decode';
import  setAuthToken  from './utils/setAuthToken';
import { setCurrentUser } from './actions/authActions';
import Navbar from './components/layout/Navbar';
import Landing from './components/layout/Landing';
import Footer from './components/layout/Footer';
import Register from './components/auth/Register';
import Login from './components/auth/Login';
import './App.css';

//check for token
if(localStorage.jwtToken){
  //set auth token header auth
  setAuthToken(localStorage.jwtToken);

  //Decode token and get user info and exp
  const decoded = jwt_decode(localStorage.jwtToken);

  //set user and isAuthenticated

  store.dispatch(setCurrentUser(decoded));
}

class App extends Component {


  render() {
    return (
      <Provider store = {store}>
        <Router>
          <div className="App">
            <Navbar />
            <Route exact path = "/" component={ Landing } />
            <div className="container">
              <Route exact path = "/register" component={ Register } />
              <Route exact path = "/login" component={ Login } />
            </div>

            <Footer />
          </div>
        </Router>
      </Provider>
    );
  }
}

export default App;