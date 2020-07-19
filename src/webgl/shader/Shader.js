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

export const createRenderShaderProgram = function(glContext, vertexShader, fragmentShader) {
  const renderShaderProgram = glContext.createProgram();
  glContext.attachShader(renderShaderProgram, vertexShader);
  glContext.attachShader(renderShaderProgram, fragmentShader);
  glContext.linkProgram(renderShaderProgram);

  const success = glContext.getProgramParameter(renderShaderProgram, glContext.LINK_STATUS);
  if(success) {
    console.log("Succeed to create render shader program.");
    return renderShaderProgram;
  }

  alert("Failed to create render shader program.");
  console.log(glContext.getProgramInfoLog(renderShaderProgram));
  glContext.deleteProgram(renderShaderProgram);

  return null;
}

export const createComputeShaderProgram = function(glContext, computeShader) {
  const computeShaderProgram = glContext.createProgram();
  glContext.attachShader(computeShaderProgram, computeShader);
  glContext.linkProgram(computeShaderProgram);

  const success = glContext.getProgramParameter(computeShaderProgram, glContext.LINK_STATUS);
  if(success) {
    console.log("Succeed to create compute shader program.");
    return computeShaderProgram;
  }

  alert("Failed to create compute shader program.");
  console.log(glContext.getProgramInfoLog(computeShaderProgram));
  glContext.deleteProgram(computeShaderProgram);

  return null;
}