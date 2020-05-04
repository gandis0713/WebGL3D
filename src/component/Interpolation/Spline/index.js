import React, {useEffect} from 'react'
import App from "./src/app.js"

function Spline() {

  let body = null;
  const onMouned = function() {
    body = document.getElementById("spline");
    const app = new App(body);
    app.start();
  }

  useEffect(onMouned, []);
  return(
    <div id="spline"/>
  );
}

export default Spline;