import React from 'react';

import { makeStyles, createStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import ListItem from '@material-ui/core/ListItem';
import ListVolume from '../List/ListVolume'

import { Switch, Redirect, Route, Link as RouterLink } from 'react-router-dom';

const useStyles = makeStyles (
  theme => (
    createStyles (
      {
        root: {
          display: "flex"
        },
        drawer: {
          width: 240,
          flexShrink: 0,
        },
        drawerPaper: {
          width: 240,
        },
        content: {
          flexGrow: 1
        },
        toolbar: theme.mixins.toolbar,
      }
    )
  )
);

function TabVolume() {

  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Drawer
        className={classes.drawer}
        variant="permanent"
        classes={{
          paper: classes.drawerPaper
        }}
      >
        <div className={classes.toolbar} />
        <List>
          <ListItem button key={0} component={RouterLink} to="/volume/triangle">
            Triangle
          </ListItem>
        </List>
        <Divider />
        <List />
      </Drawer>
      {/* <div className={classes.content}>
        <div className={classes.toolbar} />
        <Switch>
          <Route
            exact
            path="/triangle"
            component={Triangle}
          />
        </Switch>
      </div> */}
    </div>
  );
}

export default TabVolume;