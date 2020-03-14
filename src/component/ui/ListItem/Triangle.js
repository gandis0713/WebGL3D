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

  return (
    <div>
      <div>
        Triangle
      </div>
    </div>
  );
}

export default Triangle;