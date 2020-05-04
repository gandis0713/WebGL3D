import React, {useState} from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Drawer from '@material-ui/core/Drawer';
import Collapse from '@material-ui/core/Collapse';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import IconButton from '@material-ui/core/IconButton';
import ListSubheader from '@material-ui/core/ListSubheader';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import ListItem from '@material-ui/core/ListItem';
import { makeStyles } from '@material-ui/core/styles';

import { Switch, Redirect, Route, Link as RouterLink } from 'react-router-dom';

import Triangle from './component/Basic/Triangle/Triangle'
import TriangleInClipSpace from './component/Basic/TriangleInClipSpace/TriangleInClipSpace'
import ObjectOrientation from './component/Basic/ObjectOrientation'
import CameraOrbit from './component/Basic/CameraOrbit'
import FrameBufferRendering from './component/Basic/FrameBufferRendering'
import DirectionLight from './component/Basic/DirectionLight'
import Magnifier from './component/ImageEffect/Magnifier'
import Sharpening from './component/ImageEffect/Sharpening'
import Smoothing from './component/ImageEffect/Smoothing'
import VolumeSlice from "./component/Volume/VolumeSlice";
import Volume3D from "./component/Volume/Volume3D";
import Mesh2D from "./component/Mesh/Mesh2D";
import Line2D from "./component/Mesh/Line2D";
import Spline from "./component/Interpolation/Spline";

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

  const classes = useStyles();
  const [imageEffectExpand, setImageEffectExpand] = useState(false);
  const [basicExpand, setBasicExpand] = useState(false);
  const [meshExpand, setMeshExpand] = useState(false);
  const [volumeExpand, setVolumeExpand] = useState(false);
  const [interpolationExpand, setInterpolationExpand] = useState(false);

  const onExpandBasic = (event) => {
    event.preventDefault();
    setBasicExpand(!basicExpand);
  };
  const onExpandImageEffect = (event) => {
    event.preventDefault();
    setImageEffectExpand(!imageEffectExpand);
  };
  const onExpandMesh = (event) => {
    event.preventDefault();
    setMeshExpand(!meshExpand);
  };

  const onExpandVolume = (event) => {
    event.preventDefault();
    setVolumeExpand(!volumeExpand);
  };

  const onExpandInterpolation = (event) => {
    event.preventDefault();
    setInterpolationExpand(!interpolationExpand);
  }

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
          <Divider />
          <List        
            subheader={
            <ListSubheader>
              Basic
              <IconButton onClick={onExpandBasic}>
                {basicExpand ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
            </ListSubheader>
          }>
            <Collapse in={basicExpand} timeout="auto" unmountOnExit={false}>
              <ListItem button key={0} component={RouterLink} to="/Bacis_Triangle">
                Triangle
              </ListItem>
              <ListItem button key={1} component={RouterLink} to="/Bacis_TriangleInClipSpace">
                TriangleInClipSpace
              </ListItem>
              <ListItem button key={2} component={RouterLink} to="/Bacis_ObjectOrientation">
                Object Orientation
              </ListItem>
              <ListItem button key={3} component={RouterLink} to="/Bacis_CameraOrbit">
                Camera Orbit
              </ListItem>
              <ListItem button key={4} component={RouterLink} to="/Bacis_FrameBufferRendering">
                FrameBuffer Rendering
              </ListItem>
              <ListItem button key={5} component={RouterLink} to="/Bacis_DirectionLight">
                Direction Light
              </ListItem>
            </Collapse>
          </List>
          <Divider />
          <List        
            subheader={
            <ListSubheader>
              Image Effect
              <IconButton onClick={onExpandImageEffect}>
                {imageEffectExpand ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
            </ListSubheader>
          }>
            <Collapse in={imageEffectExpand} timeout="auto" unmountOnExit={false}>
              <ListItem button key={0} component={RouterLink} to="/Convolution_Magnifier">
                Magnifier
              </ListItem>
              <ListItem button key={1} component={RouterLink} to="/Convolution_Sharpening">
                Sharpening
              </ListItem>
              <ListItem button key={2} component={RouterLink} to="/Convolution_Smoothing">
                Smoothing
              </ListItem>
            </Collapse>
          </List>
          <Divider />
          <List        
            subheader={
            <ListSubheader>
              Interpolation
              <IconButton onClick={onExpandInterpolation}>
                {interpolationExpand ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
            </ListSubheader>
          }>
            <Collapse in={interpolationExpand} timeout="auto" unmountOnExit={false}>
              <ListItem button key={0} component={RouterLink} to="/Interpolation_Spline">
                Spline
              </ListItem>
            </Collapse>
          </List>
          <Divider />
          <List        
            subheader={
            <ListSubheader>
              Mesh
              <IconButton onClick={onExpandMesh}>
                {meshExpand ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
            </ListSubheader>
          }>
            <Collapse in={meshExpand} timeout="auto" unmountOnExit={false}>
              <ListItem button key={0} component={RouterLink} to="/Mesh_Mesh2D">
                Mesh 2D
              </ListItem>
              <ListItem button key={1} component={RouterLink} to="/Mesh_Line2D">
                Line 2D
              </ListItem>
            </Collapse>
          </List>
          <Divider />
          <List        
            subheader={
            <ListSubheader>
              Volume
              <IconButton onClick={onExpandVolume}>
                {volumeExpand ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
            </ListSubheader>
          }>
            <Collapse in={volumeExpand} timeout="auto" unmountOnExit={false}>
              <ListItem button key={0} component={RouterLink} to="/Volume_VolumeSlice">
                Volume Slice
              </ListItem>
              <ListItem button key={1} component={RouterLink} to="/Volume_Volume3D">
                Volume 3D
              </ListItem>
            </Collapse>
          </List>
          <Divider />
        </Drawer>
        <div className={classes.content}>
          <div className={classes.toolbar} />
          <Switch>
            <Route exact path="/Bacis_Triangle" component={Triangle}/>
            <Route exact path="/Bacis_TriangleInClipSpace" component={TriangleInClipSpace}/>
            <Route exact path="/Bacis_ObjectOrientation" component={ObjectOrientation}/>
            <Route exact path="/Bacis_CameraOrbit" component={CameraOrbit}/>
            <Route exact path="/Bacis_FrameBufferRendering" component={FrameBufferRendering}/>
            <Route exact path="/Bacis_DirectionLight" component={DirectionLight}/>

            <Route exact path="/Convolution_Magnifier" component={Magnifier}/>
            <Route exact path="/Convolution_Sharpening" component={Sharpening}/>
            <Route exact path="/Convolution_Smoothing" component={Smoothing}/>
            
            <Route exact path="/Interpolation_Spline" component={Spline}/>

            <Route exact path="/Mesh_Mesh2D" component={Mesh2D}/>
            <Route exact path="/Mesh_Line2D" component={Line2D}/>

            <Route exact path="/Volume_VolumeSlice" component={VolumeSlice}/>
            <Route exact path="/Volume_Volume3D" component={Volume3D}/>
          </Switch>
        </div>
      </div>
    </div>
  );
}

export default App;
