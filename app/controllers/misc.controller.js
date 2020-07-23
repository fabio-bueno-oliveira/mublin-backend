// Imagekit auth
exports.imagekit = (req, res) => {

  var ImageKit = require("imagekit");
  var fs = require('fs');

  var imagekit = new ImageKit({
    publicKey : "public_vFOVSJ4ZRbnv5fT4XZFbo82R2DE=",
    privateKey : process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint : "https://ik.imagekit.io/mublin/"
  });

  var authenticationParameters = imagekit.getAuthenticationParameters();
  console.log(authenticationParameters);
  res.send(authenticationParameters)
};