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
import ObjectOrientation from './component/Examples/ObjectOrientation'
import CameraOrbit from './component/Examples/CameraOrbit'
import Texture from './component/Examples/Texture'
import FrameBufferRendering from './component/Examples/FrameBufferRendering'
import DirectionLight from './component/Examples/DirectionLight'

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
            <ListItem button key={2} component={RouterLink} to="/ObjectOrientation">
            Object Orientation
            </ListItem>
            <ListItem button key={3} component={RouterLink} to="/CameraOrbit">
            Camera Orbit
            </ListItem>
            <ListItem button key={4} component={RouterLink} to="/Texture">
            Texture
            </ListItem>
            <ListItem button key={5} component={RouterLink} to="/FrameBufferRendering">
            FrameBuffer Rendering
            </ListItem>
            <ListItem button key={6} component={RouterLink} to="/DirectionLight">
            Direction Light
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
            <Route exact path="/ObjectOrientation" component={ObjectOrientation}/>
            <Route exact path="/CameraOrbit" component={CameraOrbit}/>
            <Route exact path="/Texture" component={Texture}/>
            <Route exact path="/FrameBufferRendering" component={FrameBufferRendering}/>
            <Route exact path="/DirectionLight" component={DirectionLight}/>
          </Switch>
        </div>
      </div>
    </div>
  );
}

export default App;
