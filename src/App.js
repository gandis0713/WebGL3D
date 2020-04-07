import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import ListItem from '@material-ui/core/ListItem';
import { makeStyles } from '@material-ui/core/styles';

import { Switch, Redirect, Route, Link as RouterLink } from 'react-router-dom';

import Triangle from './component/Examples/Triangle/Triangle'
import TriangleInClipSpace from './component/Examples/TriangleInClipSpace/TriangleInClipSpace'
import TriangleTransfrom from './component/Examples/TriangleTransfrom/TriangleTransfrom'
import TriangleOrbit from './component/Examples/TriangleOrbit/TriangleOrbit'

const drawerWidth = 240;

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex'
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0
  },
  drawerPaper: {
    width: drawerWidth
  },
  content: {
    flexGrow: 1
  },
  toolbar: theme.mixins.toolbar
}));

function App() {

  const classes = useStyles()
  return (
    <div>
      <div className={classes.root}>
        <AppBar  position="fixed"  className={classes.appBar}>
          <Toolbar>
            <Typography variant="h6" noWrap>
              WebGL Tutorial
            </Typography>
          </Toolbar>
        </AppBar>
        <Drawer
          className={classes.drawer}
          variant="permanent"
          classes={{
            paper: classes.drawerPaper
          }}
        >
          <div className={classes.toolbar} />
          <List>
            <ListItem button key={0} component={RouterLink} to="/Triangle">
              Triangle
            </ListItem>
            <ListItem button key={1} component={RouterLink} to="/TriangleInClipSpace">
            TriangleInClipSpace
            </ListItem>
            <ListItem button key={2} component={RouterLink} to="/TriangleTransfrom">
            TriangleTransfrom
            </ListItem>
            <ListItem button key={3} component={RouterLink} to="/TriangleOrbit">
            Triangle Orbit
            </ListItem>
          </List>
          <Divider />
          <List />
        </Drawer>
        <div className={classes.content}>
          <div className={classes.toolbar} />
          <Switch>
            <Route exact path="/Triangle" component={Triangle}/>
            <Route exact path="/TriangleInClipSpace" component={TriangleInClipSpace}/>
            <Route exact path="/TriangleTransfrom" component={TriangleTransfrom}/>
            <Route exact path="/TriangleOrbit" component={TriangleOrbit}/>
          </Switch>
        </div>
      </div>
    </div>
  );
}

export default App;
