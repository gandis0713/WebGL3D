export const createShader = function(glContext, shaderType, shaderSource) {
  const shader = glContext.createShader(shaderType);
  glContext.shaderSource(shader, shaderSource);
  glContext.compileShader(shader);

  const success = glContext.getShaderParameter(shader, glContext.COMPILE_STATUS);
  if(success) {
    console.log("Succeed to create shader.");
    return shader;
  }

  alert("Failed to create shader");
  console.log(glContext.getShaderInfoLog(shader), shaderSource);
  glContext.deleteShader(shader);
  return null;
}

export const createShaderProgram = function(glContext, vertexShader, fragmentShader) {
  const shaderProgram = glContext.createProgram();
  glContext.attachShader(shaderProgram, vertexShader);
  glContext.attachShader(shaderProgram, fragmentShader);
  glContext.linkProgram(shaderProgram);

  const success = glContext.getProgramParameter(shaderProgram, glContext.LINK_STATUS);
  if(success) {
    console.log("Succeed to create shader program.");
    return shaderProgram;
  }

  alert("Failed to create shader program.");
  console.log(glContext.getProgramInfoLog(shaderProgram));
  glContext.deleteProgram(shaderProgram);

  return null;
}