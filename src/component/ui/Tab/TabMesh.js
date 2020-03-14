import React from 'react';

import { makeStyles, createStyles } from '@material-ui/core/styles';
import Triangle from '../ListItem/Triangle'
import ListMesh from '../List/ListMesh'

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

function TabMesh() {

  const classes = useStyles();

  return (
    <div className={classes.root}>
      <ListMesh/>
      <div className={classes.content}>
        <div className={classes.toolbar} />
        <Switch>
          <Route
            exact
            path="mesh/triangle"
            component={Triangle}
          />
        </Switch>
      </div>
    </div>
  );
}

export default TabMesh;