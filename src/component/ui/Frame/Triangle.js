import React from 'react';
import { makeStyles, createStyles } from '@material-ui/core/styles';

const useStyles = makeStyles (
  theme => (
    createStyles (
      {
        root: {
          width: "600px",
          height: "600px",
          position: "relative"
        }
      }
    )
  )
);

function Triangle() {

  const classes = useStyles();
  return (
    <div className={classes.root}>
      <div className={classes.root}>
        Triangle
      </div>
    </div>
  );
}

export default Triangle;