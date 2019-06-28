import React, {Suspense} from 'react';
import {Route} from 'react-router-dom';
import {Switch} from 'react-router-dom';
import logo from './react.svg';
import Home from './Home';
import Article from './Article';
import './App.css';

function App() {
  return (
    <div className="App">
      <div className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <h1>Lightyear Redux Example</h1>
      </div>
      <Suspense fallback="">
        <Switch>
          <Route exact={true} path="/" component={Home} />
          <Route
            path="/:id"
            render={({match}) => <Article id={match.params.id} />}
          />
        </Switch>
      </Suspense>
    </div>
  );
}

export default App;
