import React from 'react'
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import ListItem from '@material-ui/core/ListItem';
import { makeStyles, createStyles } from '@material-ui/core/styles';
import Triangle from '../ListItem/Triangle'

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

function ListMesh() {
  
  const classes = useStyles();
  
  return (
    <div>
      <Drawer
        className={classes.drawer}
        variant="permanent"
        classes={{
          paper: classes.drawerPaper
        }}
      >
        <div className={classes.toolbar} />
        <List>
          <ListItem button key={0} component={RouterLink} to="mesh/triangle">
            Triangle
          </ListItem>
        </List>
        <Divider />
        <List />
      </Drawer>
    </div>
  );
}

export default ListMesh