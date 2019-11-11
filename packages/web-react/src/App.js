import React from 'react';
import {connect} from 'react-redux';
import WelcomePage from './components/WelcomePage';
import MainPage from './components/MainPage';

function App({isAuthenticated}) {
  return (
    <>
      {
        isAuthenticated ?
          (<MainPage />) :
          (<WelcomePage />)
      }
    </>
  );
}

export default connect(
  (state) => ({isAuthenticated: state.auth.isAuthenticated})
)(App);
