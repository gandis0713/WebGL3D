import React from 'react';

import { withRouter, Switch, Route } from 'react-router-dom';

import TopBar from './component/ui/Top/TopBar';
import {Top} from './component/ui/Top/TopBar';
import Mesh from './component/ui/Tab/Mesh';
import Volume from './component/ui/Tab/Volume';

function App() {
  return (
    <div>
      <TopBar/>      
      <Switch>
        <Route path={Top.tabVolume.path}  component={Volume}></Route>
        <Route exact path={Top.tabMesh.path} component={Mesh}></Route>
      </Switch>
    </div>
  );
}

export default withRouter(App);
