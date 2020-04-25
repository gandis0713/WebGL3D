import vtkXMLImageDataReader from 'vtk.js/Sources/IO/XML/XMLImageDataReader';

const openXmlVtiFile = (url) => {
  return new Promise((resolve, reject) => {
    const reader = vtkXMLImageDataReader.newInstance();
    reader
      .setUrl(url, { loadData: true })
      .then(() => {
        const imageData = reader.getOutputData();       

        const volume = {};

        volume.bounds = imageData.getBounds();
        volume.center = imageData.getCenter();
        volume.origin = imageData.getOrigin();
        volume.spacing = imageData.getSpacing();
        volume.dimension = imageData.getDimensions();
        volume.extent = imageData.getExtent();
        volume.data = imageData.getPointData().getScalars().getData();
        volume.direction = imageData.getDirection();

        resolve(volume);
      })
      .catch(() => {
        reject();
      });
  });
};

export default openXmlVtiFile;
