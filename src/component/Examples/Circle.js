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

function Circle() {

  const classes = useStyles()
  return (
    <div className={classes.root}>
    <div>
      <h4>Circle Image</h4>
    </div>
  </div>
  );
}

export default Circle;