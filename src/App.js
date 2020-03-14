import React from 'react';

import { withRouter, Switch, Route } from 'react-router-dom';

import TopBar  from './component/ui/Top/TopBar';
import TabMesh from './component/ui/Tab/TabMesh';
import TabVolume from './component/ui/Tab/TabVolume';
import ListMesh from './component/ui/List/ListMesh'

function App() {
  return (
    <div>
      <TopBar/>      
      <Switch>
        <Route exact path={"/mesh"} component={TabMesh}>       
          <Route path={"/:id"} component={ListMesh}/>        
        </Route>
        <Route path={"/volume"} component={TabVolume}>          
          <Route path={"/triangle"} component={ListMesh}/>
        </Route>
      </Switch>
    </div>
  );
}

export default withRouter(App);
